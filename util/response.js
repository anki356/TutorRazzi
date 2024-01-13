

export const responseObj = (success, data, message, error = []) => {
    if (message===null)message="Successfully Processed"
    return {
        success,
        data,
        message,
        error
    }
}