import React, { useMemo } from "react";

type GridProps = {
    container?: boolean;
    size?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
}
export const Grid: React.FC<GridProps> = (props) => {
    const { container, size } = props;

    const style = useMemo(() => {
        const _style: React.CSSProperties = {};
        if (container) {
            _style.display = 'flex';
            _style.flexWrap = 'wrap';
        }
        if (size) {
            _style.width = `${(size / 12) * 100}%`
        }
        return _style;
    }, [container, size]);

    return (
        <div style={style}>
            {props.children}
        </div>
    );
}
