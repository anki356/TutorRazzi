

export const responseObj = (success, data, message, error = []) => {
    return {
        success,
        data,
        message,
        error
    }
}