import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Result, Button } from 'antd';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <Result
                    status="error"
                    title="متاسفانه خطایی رخ داده است"
                    subTitle={this.state.error?.message || 'لطفاً صفحه را مجدداً بارگذاری کنید'}
                    extra={[
                        <Button 
                            key="reload" 
                            type="primary"
                            onClick={() => window.location.reload()}
                        >
                            بارگذاری مجدد
                        </Button>,
                        <Button 
                            key="back" 
                            onClick={() => window.history.back()}
                        >
                            بازگشت
                        </Button>
                    ]}
                />
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary; 
