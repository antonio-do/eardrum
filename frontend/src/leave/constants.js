const LEAVE_TYPES = [
    { label: "type 1", field: "type1" }, 
    { label: "type 2", field: "type2" }, 
    { label: "type 3", field: "type3" }, 
    { label: "type 4", field: "type4" }, 
    { label: "sick", field: "whatever" },
]

const STATUS_TYPES = {
    REJECTED: "rejected",
    APPROVED: "approved",
    PENDING: "pending",
}

const DATE_FORMAT = {
    VALUE: "YYYYMMDD",
    LABEL: "DD/MM/YYYY",
    LABEL_DATEFNS: "dd/MM/yyyy",
}

export { LEAVE_TYPES, STATUS_TYPES, DATE_FORMAT }