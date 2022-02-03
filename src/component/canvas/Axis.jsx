// @flow
import type {Node} from 'react';
import Series from '../../series/Series';
import ContinuousScale from '../../scale/continuousScale';
import CategoricalScale from '../../scale/categoricalScale';
import {renderText as renderDefaultText, renderLine} from '../../util/defaultRenderFunctions';

import React from 'react';
import {max} from 'd3-array';

type Position = 'top' | 'right' | 'bottom' | 'left';
type DimensionKey = 'x' | 'y';

type Props = {
    // required
    position: Position,
    scales: {
        series: Series,
        x: ContinuousScale | CategoricalScale,
        y: ContinuousScale | CategoricalScale
    },

    // optional
    location?: number | string | Date,
    axisRef?: any,

    // style
    strokeWidth: string,
    strokeColor: string,
    textColor: string,
    textSize: number,
    textOffset: number,
    textFormat: mixed => string,
    ticks: Function,
    tickLength: number,

    // component
    renderText?: Function,
    renderAxisLine?: Function,
    renderTickLine?: Function
};

export default class AxisRenderable extends React.PureComponent<Props> {
    static defaultProps = {
        // Styles
        strokeWidth: 1,
        strokeColor: '#222',
        textColor: '#222',
        textSize: 10,
        textOffset: 6,
        textFormat: (text: mixed) => String(text),

        ticks: (scale: {ticks: () => Array<mixed>, domain: () => Array<mixed>}) =>
            scale.ticks ? scale.ticks() : scale.domain(),
        tickLength: 6,

        // Components
        AxisLine: 'line',
        TickLine: 'line',
        Text: 'text'
    };

    dimension(): DimensionKey {
        const {position} = this.props;
        return position === 'top' || position === 'bottom' ? 'x' : 'y';
    }

    drawTicks(): Array<Node> {
        const {
            renderText = renderDefaultText,
            renderTickLine = renderLine,
            strokeColor,
            position,
            textOffset,
            textSize,
            textColor,
            tickLength
        } = this.props;

        const dimension = this.dimension();
        const {textFormat} = this.props;
        const {x, y} = this.props.scales;
        const {ticks} = this.props;
        const scale = dimension === 'x' ? x.scale : y.scale;
        const offset = 0;
        const strokeWidth = parseInt(this.props.strokeWidth, 10);

        return ticks(scale).map((tick: any): Node => {
            const distance = scale(tick) + offset;
            const formattedTick = textFormat(tick);

            const [x1, y1] = this.getPointPosition(position, distance, strokeWidth / 2);
            const [x2, y2] = this.getPointPosition(
                position,
                distance,
                strokeWidth / 2 + tickLength
            );

            const [textX, textY] = this.getPointPosition(
                position,
                distance,
                strokeWidth / 2 + tickLength + textOffset
            );

            const tickLineProps = {
                x1,
                y1,
                x2,
                y2,
                strokeWidth: this.props.strokeWidth,
                stroke: strokeColor
            };

            const textProps = {
                children: formattedTick,
                fontSize: textSize,
                fill: textColor,
                x: textX,
                y: textY,
                textAnchor: this.getTextAnchorProp(position),
                dominantBaseline: this.getAlignmentBaselineProp(position)
            };

            return (
                <g key={tick}>
                    {renderTickLine({tick, position: tickLineProps})}
                    {renderText({tick, position: textProps})}
                </g>
            );
        });
    }

    drawAxisLine(): Node {
        const {renderAxisLine = renderLine, position, strokeColor, strokeWidth} = this.props;

        const [x1, y1] = this.getPointPosition(position, 0, 0);
        const [x2, y2] = this.getPointPosition(position, this.getLength(), 0);

        return renderAxisLine({
            position: {
                x1,
                y1,
                x2,
                y2,
                strokeWidth: strokeWidth,
                stroke: strokeColor
            }
        });
    }

    getAlignmentBaselineProp(position: Position): string {
        if (position === 'left' || position === 'right') return 'middle';
        if (position === 'top') return 'auto';
        return 'hanging';
    }

    getTextAnchorProp(position: Position): string {
        switch (position) {
            case 'top':
            case 'bottom':
                return 'middle';
            case 'left':
                return 'end';
            case 'right':
            default:
                return 'start';
        }
    }

    getLength(): number {
        return max(this.props.scales[this.dimension()].range);
    }

    getPointPosition(position: Position, distance: number, offset: number): Array<number> {
        let locationValue = 0;
        let {location} = this.props;
        const {x, y} = this.props.scales;
        const dimension = this.dimension();
        const width = max(x.range);
        const height = max(y.range);

        if (this.props.location != undefined) {
            if (dimension === 'y') {
                locationValue = x.scale(this.props.location);
            } else {
                locationValue = y.scale(this.props.location);
            }
        }

        switch (position) {
            case 'top':
                return [distance, locationValue - offset];

            case 'bottom':
                locationValue = location != null ? locationValue : height;
                return [distance, locationValue + offset];

            case 'left':
                return [locationValue - offset, distance];

            case 'right':
                locationValue = location != null ? locationValue : width;
                return [locationValue + offset, distance];

            default:
                throw new Error(`unknown position: ${position}`);
        }
    }

    render(): Node {
        return (
            <g shapeRendering="crispedges" ref={this.props.axisRef}>
                <g>{this.drawAxisLine()}</g>
                <g>{this.drawTicks()}</g>
            </g>
        );
    }
}
