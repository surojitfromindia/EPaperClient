const isValidNumber = (value:unknown) => {
    if(typeof value === 'number') return true;
    if (value === null) return false
    if (value === undefined) return false
    if (value === '') return false
    if (Number.isNaN(value)) return false
    if (Array.isArray(value)) return false;
}
export { isValidNumber };