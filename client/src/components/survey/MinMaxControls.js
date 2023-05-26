
function MinimumSelectable(props) {
    const type = props.type;
    const min = props.min;
    const hint = type === 0 ? "(Mandatory)" : `(Mandatory - You have to select at least ${min} options)`;

    if (min >= 1)
        return (<span style={{ color: "red" }} className="mx-2">{hint}</span>);
    else if (min === 0)
        return (<span style={{ color: "grey" }} className="mx-2">(Optional)</span>);
    else
        return (<></>);
}

function MaximumSelectable(props) {
    const max = props.max;
    return (<span style={{ color: "blue" }} className="mx-2">(Max selectable: {max})</span>);
}

export { MinimumSelectable, MaximumSelectable };