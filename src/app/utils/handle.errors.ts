export function HandleErrorMessage(error: any): string {
    let message: string = '';

    if (error && error.error) {
        if (Array.isArray(error.error.errors) && error.error.errors.length > 0) {
            message = error.error.errors.join(', ');
        } else {
            message = JSON.stringify(error.error);
        }
    } else {
        if (typeof error === 'string') {
            message = error;
        } else if (Array.isArray(error)) {
            if (error.every(item => Array.isArray(item))) {
                const flattened = error.flat().join(', ');
                message = flattened;
            } else {
                message = error.join(', ');
            }
        } else if (typeof error === 'object') {
            if (Array.isArray(error.errors)) {
                message = error.errors.join(', ');
            } else if (typeof error.message === 'string') {
                message = error.message;
            } else if (Array.isArray(error.message)) {
                message = error.message.join(', ');
            } else if (typeof error.error === 'object') {
                if (Array.isArray(error.error.message)) {
                    message = error.error.message.join(', ');
                } else if (typeof error.error.message === 'string') {
                    message = error.error.message;
                } else {
                    message = JSON.stringify(error.error);
                }
            } else {
                message = JSON.stringify(error);
            }
        } else {
            message = String(error);
        }
    }

    return message;
}
