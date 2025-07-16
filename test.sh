#!/bin/bash

# Monthly Paycheck SaaS - Test Runner
echo "🚀 Monthly Paycheck SaaS - Hebrew Name Extraction Test"
echo "================================================="

# Function to run tests
run_validation() {
    echo "🔍 Step 1: Running environment validation..."
    docker-compose -f docker-compose.test.yml run --rm test
    
    if [ $? -eq 0 ]; then
        echo "✅ Environment validation passed!"
        return 0
    else
        echo "❌ Environment validation failed!"
        return 1
    fi
}

# Function to create test PDF
create_test_pdf() {
    echo "📄 Step 2: Creating test PDF..."
    docker-compose -f docker-compose.test.yml run --rm test python create_test_pdf.py
    
    if [ $? -eq 0 ]; then
        echo "✅ Test PDF created successfully!"
        return 0
    else
        echo "⚠️  Test PDF creation failed, but you can still test with your own PDF"
        return 1
    fi
}

# Function to start the application
start_app() {
    echo "🌐 Step 3: Starting web application..."
    echo "Open your browser to: http://localhost:8000"
    echo "Press Ctrl+C to stop the application"
    echo ""
    docker-compose -f docker-compose.test.yml --profile app up --build
}

# Parse command line arguments
case "${1:-all}" in
    "validate")
        run_validation
        ;;
    "pdf")
        create_test_pdf
        ;;
    "app")
        start_app
        ;;
    "all")
        run_validation
        if [ $? -eq 0 ]; then
            create_test_pdf
            echo ""
            echo "🎉 Ready to test! Starting the application..."
            echo "   - Test basic name extraction: http://localhost:8000/test-names"
            echo "   - Upload PDF for testing: http://localhost:8000"
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
        echo "  all       Run validation, create test PDF, and start app (default)"
        echo "  validate  Only run environment validation"
        echo "  pdf       Only create test PDF"
        echo "  app       Only start the web application"
        echo "  help      Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0                # Run full test suite"
        echo "  $0 validate       # Just check if everything is set up"
        echo "  $0 app           # Just start the web app"
        ;;
    *)
        echo "❌ Unknown command: $1"
        echo "Run '$0 help' for usage information"
        exit 1
        ;;
esac 