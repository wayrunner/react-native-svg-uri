import React, { Component } from "react";
import { View } from 'react-native';
import PropTypes from 'prop-types'
import xmldom from 'xmldom';
import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource';

import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  Line,
  LinearGradient,
  Path,
  Polygon,
  Polyline,
  RadialGradient,
  Rect,
  Stop,
  Text,
  TSpan
} from 'react-native-svg';

import * as utils from './utils';

const ACCEPTED_SVG_ELEMENTS = [
  'svg',
  'g',
  'circle',
  'path',
  'rect',
  'defs',
  'line',
  'linearGradient',
  'radialGradient',
  'stop',
  'ellipse',
  'polygon',
  'polyline',
  'text',
  'tspan'
];

// Attributes from SVG elements that are mapped directly.
const SVG_ATTS = ['viewBox', 'width', 'height'];
const G_ATTS = ['id'];

const CIRCLE_ATTS = ['cx', 'cy', 'r'];
const PATH_ATTS = ['d'];
const RECT_ATTS = ['width', 'height'];
const LINE_ATTS = ['x1', 'y1', 'x2', 'y2'];
const LINEARG_ATTS = LINE_ATTS.concat(['id', 'gradientUnits']);
const RADIALG_ATTS = CIRCLE_ATTS.concat(['id', 'gradientUnits']);
const STOP_ATTS = ['offset'];
const ELLIPSE_ATTS = ['cx', 'cy', 'rx', 'ry'];

const TEXT_ATTS = ['fontFamily', 'fontSize', 'fontWeight', 'textAnchor']

const POLYGON_ATTS = ['points'];
const POLYLINE_ATTS = ['points'];

const COMMON_ATTS = ['fill', 'fillOpacity', 'stroke', 'strokeWidth', 'strokeOpacity', 'opacity',
  'strokeLinecap', 'strokeLinejoin', 'transform', 'clipPath',
  'strokeDasharray', 'strokeDashoffset', 'x', 'y', 'rotate', 'scale', 'origin', 'originX', 'originY'];

let ind = 0;

function fixYPosition(y, node) {
  if (node.attributes) {
    const fontSizeAttr = Object.keys(node.attributes)
    .find(a => node.attributes[a].name === 'font-size');
    if (fontSizeAttr) {
      return '' + (parseFloat(y) - parseFloat(node.attributes[fontSizeAttr].value));
    }
  }
  if (!node.parentNode) {
    return y;
  }
  return fixYPosition(y, node.parentNode)
}

// Remove empty strings from children array
function trimElementChilden(children) {
  for (child of children) {
    if (typeof child === 'string') {
      if (child.trim().length === 0)
        children.splice(children.indexOf(child), 1);
    }
  }
}

function SvgUri(props) {
  const [state, setState] = React.useState({ fill: props.fill, svgXmlData: props.svgXmlData })
  const isComponentMounted = React.useRef()

  // Gets the image data from an URL or a static file
  const source = props.source ? resolveAssetSource(props.source) || {} : {};
  React.useEffect(() => {
    if (source) {
      this.fetchSVGData(source.uri);
    }
    isComponentMounted.current = true;
    return () => isComponentMounted.current = false
  }, [source])

  React.useEffect(() => {
    const { onLoad } = this.props;
    if (state.svgXmlData && onLoad && !error) {
      onLoad();
    }
  }, [state.svgXmlData])

  React.useEffect(() => setState({ ...state, svgXmlData: props.svgXmlData }), [props.svgXmlData])
  React.useEffect(() => setState({ ...state, fill: props.fill }), [props.fill])

  async function fetchSVGData(uri) {
    let responseXML = null, error = null;
    try {
      const response = await fetch(uri);
      responseXML = await response.text();
    }
    catch (e) {
      error = e;
      console.error("ERROR SVG", e);
    } finally {
      if (isComponentMounted.current) {
        setState({ ...state, svgXmlData: responseXML });
      }
    }
    return responseXML;
  }

  function createSVGElement(node, childs) {
    trimElementChilden(childs);
    let componentAtts = {};
    const i = ind++;
    switch (node.nodeName) {
      case 'svg':
        componentAtts = obtainComponentAtts(node, SVG_ATTS);
        if (props.width) {
          componentAtts.width = props.width;
        }
        if (props.height) {
          componentAtts.height = props.height;
        }

        return <Svg key={i} {...componentAtts}>{childs}</Svg>;
      case 'g':
        componentAtts = obtainComponentAtts(node, G_ATTS);
        return <G key={i} {...componentAtts}>{childs}</G>;
      case 'path':
        componentAtts = obtainComponentAtts(node, PATH_ATTS);
        return <Path key={i} {...componentAtts}>{childs}</Path>;
      case 'circle':
        componentAtts = obtainComponentAtts(node, CIRCLE_ATTS);
        return <Circle key={i} {...componentAtts}>{childs}</Circle>;
      case 'rect':
        componentAtts = obtainComponentAtts(node, RECT_ATTS);
        return <Rect key={i} {...componentAtts}>{childs}</Rect>;
      case 'line':
        componentAtts = obtainComponentAtts(node, LINE_ATTS);
        return <Line key={i} {...componentAtts}>{childs}</Line>;
      case 'defs':
        return <Defs key={i}>{childs}</Defs>;
      case 'linearGradient':
        componentAtts = obtainComponentAtts(node, LINEARG_ATTS);
        return <LinearGradient key={i} {...componentAtts}>{childs}</LinearGradient>;
      case 'radialGradient':
        componentAtts = obtainComponentAtts(node, RADIALG_ATTS);
        return <RadialGradient key={i} {...componentAtts}>{childs}</RadialGradient>;
      case 'stop':
        componentAtts = obtainComponentAtts(node, STOP_ATTS);
        return <Stop key={i} {...componentAtts}>{childs}</Stop>;
      case 'ellipse':
        componentAtts = obtainComponentAtts(node, ELLIPSE_ATTS);
        return <Ellipse key={i} {...componentAtts}>{childs}</Ellipse>;
      case 'polygon':
        componentAtts = obtainComponentAtts(node, POLYGON_ATTS);
        return <Polygon key={i} {...componentAtts}>{childs}</Polygon>;
      case 'polyline':
        componentAtts = obtainComponentAtts(node, POLYLINE_ATTS);
        return <Polyline key={i} {...componentAtts}>{childs}</Polyline>;
      case 'text':
        componentAtts = obtainComponentAtts(node, TEXT_ATTS);
        return <Text key={i} {...componentAtts}>{childs}</Text>;
      case 'tspan':
        componentAtts = obtainComponentAtts(node, TEXT_ATTS);
        if (componentAtts.y) {
          componentAtts.y = fixYPosition(componentAtts.y, node)
        }
        return <TSpan key={i} {...componentAtts}>{childs}</TSpan>;
      default:
        return null;
    }
  }

  function obtainComponentAtts({ attributes }, enabledAttributes) {
    const styleAtts = {};

    if (state.fill && props.fillAll) {
      styleAtts.fill = state.fill;
    }

    Array.from(attributes).forEach(({ nodeName, nodeValue }) => {
      Object.assign(styleAtts, utils.transformStyle({
        nodeName,
        nodeValue,
        fillProp: state.fill
      }));
    });

    const componentAtts = Array.from(attributes)
    .map(utils.camelCaseNodeName)
    .map(utils.removePixelsFromNodeValue)
    .filter(utils.getEnabledAttributes(enabledAttributes.concat(COMMON_ATTS)))
    .reduce((acc, { nodeName, nodeValue }) => {
      acc[nodeName] = (state.fill && nodeName === 'fill' && nodeValue !== 'none') ? state.fill : nodeValue
      return acc
    }, {});
    Object.assign(componentAtts, styleAtts);

    return componentAtts;
  }

  function inspectNode(node) {
    // Only process accepted elements
    if (!ACCEPTED_SVG_ELEMENTS.includes(node.nodeName)) {
      return null;
    }

    const textValue = node.nodeValue;
    if (textValue) {
      return textValue;
    }

    // Process the xml node
    const arrayElements = [];

    // if have children process them.
    // Recursive function.
    if (node.childNodes && node.childNodes.length > 0) {
      for (let i = 0; i < node.childNodes.length; i++) {
        const nodo = inspectNode(node.childNodes[i]);
        if (nodo != null) {
          arrayElements.push(nodo);
        }
      }
    }

    return createSVGElement(node, arrayElements);
  }

  const rootSVG = React.useMemo(() => {
    try {
      if (state.svgXmlData == null) {
        return null;
      }
      const inputSVG = state.svgXmlData.substring(
        state.svgXmlData.indexOf("<svg "),
        (state.svgXmlData.indexOf("</svg>") + 6)
      ).replace(/<!-(.*?)->/g, '');

      const doc = new xmldom.DOMParser().parseFromString(inputSVG);

      return inspectNode(doc.childNodes[0]);
    }  catch (e) {
      console.error("ERROR SVG", e);
      return null;
    }
  }, [state.svgXmlData, props.fill, props.width, props.height, props.fillAll])

  return (
    <View style={this.props.style}>
      {rootSVG}
    </View>
  );
}

SvgUri.propTypes = {
  style: PropTypes.object,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  svgXmlData: PropTypes.string,
  source: PropTypes.any,
  fill: PropTypes.string,
  onLoad: PropTypes.func,
  fillAll: PropTypes.bool
}

module.exports = SvgUri;
