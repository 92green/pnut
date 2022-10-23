// @flow
export default function flattenArray(data) {
    let flat = [];
    for (let i = 0; i < data.length; i++) {
        const inner = data[i];
        if (Array.isArray(inner)) {
            for (let j = 0; j < data[i].length; j++) {
                flat.push(data[i][j]);
            }
        } else {
            flat.push(inner);
        }
    }
    return flat;
}
