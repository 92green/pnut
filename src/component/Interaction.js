// @flow
import Series from '../series/Series';
import ContinuousScale from '../scale/continuousScale';
import CategoricalScale from '../scale/categoricalScale';

import React, {useEffect, useState, useCallback} from 'react';
import useMousePosition from '@react-hook/mouse-position';
import {bisectRight} from 'd3-array';

type ChildProps<A> = {
    nearestPoint: ?A,
    position: {
        x: number,
        y: number,
        pageX: number,
        pageY: number,
        clientX: number,
        clientY: number,
        screenX: number,
        screenY: number,
        elementWidth: number,
        elementHeight: number,
        isOver: boolean,
        isDown: boolean
    },
    xPoints: Array<{x: number, y: number, point: A}>
};

type Props<A> = {
    scales: {
        series: Series,
        x: ContinuousScale | CategoricalScale,
        y: ContinuousScale | CategoricalScale
    },
    height: number,
    width: number,
    fps?: number,
    onClick?: (ChildProps<A>) => void,
    onChange?: (ChildProps<A>) => void,
    children: (ChildProps<A>) => Node
};
export default function Interaction<A>(props: Props<A>) {
    const [item, setItem] = useState(null);
    const [position, ref] = useMousePosition(0, 0, props.fps || 60);
    const {width, height} = props;
    const {x, y, series} = props.scales;

    // $FlowFixMe - sucks at defaults
    const {children = () => null} = props;

    useEffect(() => {
        const xValues = x.invert(position.x);
        //const yValues = y.invert(position.y);

        const yValue = y.scale.invert(position.y);
        const xValue = x.scale.invert(position.x);
        const xPoints = xValues.map(point => ({
            x: x.scalePoint(point),
            y: y.scalePoint(point),
            point
        }));

        let nextValue;

        // Non-stacked bandwidth scales need some extra work to invert their values
        if (x.scale.bandwidth && !series.preprocess.stacked) {
            // Find the x position of the grouped columns, then find
            // the corresponding index of xValues
            const xPos = x.scale(xValue);
            const bandwidth = x.scale.bandwidth();
            const left = xPos - bandwidth / 2; // xposition of first column
            const localBand = bandwidth / (xValues.length - 1); // How wide is each columm
            const localIndex = Math.round((position.x - left) / localBand); // which index are we up to in this group
            const nearestPoint = xValues[localIndex];

            nextValue = {
                position,
                nearestPoint,
                nearestPointStepped: nearestPoint,
                xPoints
            };

            // Everything else can be found by grouping by the current x value
            // and then finding the nearest point to our mouses y value
        } else {
            const yValueArray = xValues.map(y.get);
            const nearestValue = yValueArray.reduce((prev, curr) =>
                Math.abs(curr - yValue) < Math.abs(prev - yValue) ? curr : prev
            );
            const nearestPoint = xValues.find(point => y.get(point) === nearestValue);

            // use bisect to find the insertion index of the current y value
            // this gives us the stepped value
            // stepped values are always on one point untill your mouse is definately over the next
            // scatter/line you want the closest value, stacked bar you want to stay on the bar untill
            // you reach the next bar.
            const nearestPointStepped = xValues[bisectRight(yValueArray, yValue)];

            nextValue = {
                position,
                nearestPoint,
                nearestPointStepped,
                xPoints
            };
        }

        props.onChange && props.onChange(nextValue);
        setItem(nextValue);
    }, [position]);

    const onClick = useCallback(() => {
        props.onClick && item && props.onClick(item);
    }, [item]);

    // $FlowFixMe - I dont even known
    return (
        <g className="Interaction" ref={ref} onClick={onClick}>
            <rect x={0} y={0} width={width} height={height} stroke="none" fill="rgba(0,0,0,0)" />
            {item && children(item)}
        </g>
    );
}
