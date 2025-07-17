#!/bin/bash

# Monthly Paycheck SaaS - Test Runner
echo "🚀 Monthly Paycheck SaaS - Hebrew Name Extraction Test"
echo "================================================="

# Function to run tests
run_validation() {
    echo "🔍 Step 1: Running environment validation..."
    docker-compose -f "$(dirname "$0")/../config/docker-compose.test.yml" run --rm test
    
    if [ $? -eq 0 ]; then
        echo "✅ Environment validation passed!"
        return 0
    else
        echo "❌ Environment validation failed!"
        return 1
    fi
}

# Function to start the application
start_app() {
    echo "🌐 Step 2: Starting web application..."
    echo "Open your browser to: http://localhost:8000"
    echo "Upload your own PDF file to test the system"
    echo "Press Ctrl+C to stop the application"
    echo ""
    docker-compose -f "$(dirname "$0")/../config/docker-compose.test.yml" --profile app up --build
}

# Parse command line arguments
case "${1:-all}" in
    "validate")
        run_validation
        ;;
    "app")
        start_app
        ;;
    "all")
        run_validation
        if [ $? -eq 0 ]; then
            echo ""
            echo "🎉 Ready to test! Starting the application..."
            echo "   - Test basic name extraction: http://localhost:8000/test-names"
            echo "   - Upload your PDF for testing: http://localhost:8000"
            echo ""
            start_app
        else
            echo "❌ Validation failed. Please fix the issues above before continuing."
            exit 1
        fi
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  all       Run validation and start app (default)"
        echo "  validate  Only run environment validation"
        echo "  app       Only start the web application"
        echo "  help      Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0                # Run validation and start app"
        echo "  $0 validate       # Just check if everything is set up"
        echo "  $0 app           # Just start the web app"
        echo ""
        echo "Note: Bring your own PDF file for testing!"
        ;;
    *)
        echo "❌ Unknown command: $1"
        echo "Run '$0 help' for usage information"
        exit 1
        ;;
esac 