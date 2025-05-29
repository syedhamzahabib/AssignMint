// src/components/common/ErrorBoundary.js
// Error boundary component to catch and handle React errors gracefully

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { COLORS, FONTS, SPACING } from '../../constants';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isRetrying: false,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Report error to crash analytics service (e.g., Crashlytics, Sentry)
    this.reportError(error, errorInfo);
  }

  reportError = (error, errorInfo) => {
    // In a real app, you would send this to your error reporting service
    if (__DEV__) {
      console.error('Error reported to analytics:', {
        error: error.toString(),
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
      });
    }
    
    // Example: Crashlytics.recordError(error);
    // Example: Sentry.captureException(error);
  };

  handleRetry = () => {
    this.setState({ isRetrying: true });
    
    // Give a moment for visual feedback
    setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        isRetrying: false,
      });
    }, 500);
  };

  handleReportIssue = () => {
    const { error, errorInfo } = this.state;
    const errorReport = {
      error: error?.toString() || 'Unknown error',
      stack: error?.stack || 'No stack trace',
      componentStack: errorInfo?.componentStack || 'No component stack',
      timestamp: new Date().toISOString(),
      userAgent: 'React Native',
    };

    // In a real app, you might:
    // 1. Open email client with pre-filled error report
    // 2. Navigate to a feedback screen
    // 3. Send to support API
    console.log('Error report generated:', errorReport);
    
    // For demo purposes, show an alert
    alert('Error report generated. In a real app, this would be sent to support.');
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      const { 
        title = 'Oops! Something went wrong', 
        subtitle = 'We apologize for the inconvenience. Please try again.',
        showDetails = __DEV__,
        onRetry,
        onGoHome,
      } = this.props;

      return (
        <View style={styles.container}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Error Icon */}
            <Text style={styles.errorIcon}>😵</Text>
            
            {/* Error Title */}
            <Text style={styles.title}>{title}</Text>
            
            {/* Error Subtitle */}
            <Text style={styles.subtitle}>{subtitle}</Text>
            
            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.primaryButton]}
                onPress={onRetry || this.handleRetry}
                disabled={this.state.isRetrying}
              >
                <Text style={[styles.buttonText, styles.primaryButtonText]}>
                  {this.state.isRetrying ? 'Retrying...' : '🔄 Try Again'}
                </Text>
              </TouchableOpacity>
              
              {onGoHome && (
                <TouchableOpacity 
                  style={[styles.button, styles.secondaryButton]}
                  onPress={onGoHome}
                >
                  <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                    🏠 Go Home
                  </Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={[styles.button, styles.tertiaryButton]}
                onPress={this.handleReportIssue}
              >
                <Text style={[styles.buttonText, styles.tertiaryButtonText]}>
                  📧 Report Issue
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Error Details (Development only) */}
            {showDetails && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.detailsTitle}>Error Details (Dev Mode)</Text>
                
                <View style={styles.errorSection}>
                  <Text style={styles.errorSectionTitle}>Error:</Text>
                  <Text style={styles.errorText}>
                    {this.state.error.toString()}
                  </Text>
                </View>
                
                {this.state.error.stack && (
                  <View style={styles.errorSection}>
                    <Text style={styles.errorSectionTitle}>Stack Trace:</Text>
                    <ScrollView 
                      style={styles.stackTrace}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    >
                      <Text style={styles.stackText}>
                        {this.state.error.stack}
                      </Text>
                    </ScrollView>
                  </View>
                )}
                
                {this.state.errorInfo?.componentStack && (
                  <View style={styles.errorSection}>
                    <Text style={styles.errorSectionTitle}>Component Stack:</Text>
                    <ScrollView 
                      style={styles.stackTrace}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    >
                      <Text style={styles.stackText}>
                        {this.state.errorInfo.componentStack}
                      </Text>
                    </ScrollView>
                  </View>
                )}
              </View>
            )}
            
            {/* Tips */}
            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>💡 Quick Tips:</Text>
              <Text style={styles.tipText}>• Check your internet connection</Text>
              <Text style={styles.tipText}>• Close and reopen the app</Text>
              <Text style={styles.tipText}>• Restart your device if issues persist</Text>
              <Text style={styles.tipText}>• Contact support if problem continues</Text>
            </View>
          </ScrollView>
        </View>
      );
    }

    // No error, render children normally
    return this.props.children;
  }
}

// Hook version for functional components
export const useErrorHandler = () => {
  const [error, setError] = React.useState(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const handleError = React.useCallback((error) => {
    console.error('Error caught by useErrorHandler:', error);
    setError(error);
  }, []);

  return {
    error,
    resetError,
    handleError,
  };
};

// Simple error fallback component
export const ErrorFallback = ({ 
  error, 
  onRetry, 
  title = 'Something went wrong',
  showError = false 
}) => (
  <View style={styles.fallbackContainer}>
    <Text style={styles.fallbackIcon}>😔</Text>
    <Text style={styles.fallbackTitle}>{title}</Text>
    {showError && error && (
      <Text style={styles.fallbackError}>{error.toString()}</Text>
    )}
    {onRetry && (
      <TouchableOpacity style={styles.fallbackButton} onPress={onRetry}>
        <Text style={styles.fallbackButtonText}>Try Again</Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONTS.sizes.title,
    fontWeight: FONTS.weights.bold,
    color: COLORS.gray800,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.gray600,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
    maxWidth: 280,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 280,
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  button: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.semiBold,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  primaryButtonText: {
    color: COLORS.white,
  },
  secondaryButton: {
    backgroundColor: COLORS.gray100,
    borderWidth: 1,
    borderColor: COLORS.gray300,
  },
  secondaryButtonText: {
    color: COLORS.gray700,
  },
  tertiaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.gray400,
  },
  tertiaryButtonText: {
    color: COLORS.gray600,
  },
  errorDetails: {
    width: '100%',
    backgroundColor: COLORS.gray50,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  detailsTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.error,
    marginBottom: SPACING.md,
  },
  errorSection: {
    marginBottom: SPACING.md,
  },
  errorSectionTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.gray700,
    marginBottom: SPACING.sm,
  },
  errorText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.error,
    fontFamily: 'monospace',
  },
  stackTrace: {
    maxHeight: 100,
    backgroundColor: COLORS.gray100,
    borderRadius: 8,
    padding: SPACING.sm,
  },
  stackText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray600,
    fontFamily: 'monospace',
  },
  tipsContainer: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  tipsTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.gray700,
    marginBottom: SPACING.sm,
  },
  tipText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray600,
    lineHeight: 18,
    marginBottom: 2,
  },
  
  // Fallback styles
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.background,
  },
  fallbackIcon: {
    fontSize: 48,
    marginBottom: SPACING.lg,
  },
  fallbackTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.gray700,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  fallbackError: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    fontFamily: 'monospace',
  },
  fallbackButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 8,
  },
  fallbackButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semiBold,
  },
});

export default ErrorBoundary;