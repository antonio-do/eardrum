import { message } from "antd";

const handleError = (fetchObj, errorMessage, successMessage = null) => {
    if (fetchObj.error) {
        console.error(fetchObj.error);
        message.error(errorMessage);
    } else if (successMessage !== null) {
        message.success(successMessage);
    }
    return fetchObj.error;
}

export {handleError}
