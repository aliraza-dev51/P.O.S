pipeline {
  agent any
  
  stages {
    stage('Fetch from GitHub') {
      steps {
        // Checkout the repository from GitHub
        git branch: 'main', url: 'https://github.com/Fukji/POSnext.git'
      }
    }
    
    stage('Create .env file') {
      steps {
        // Create a .env file with the API key
        sh 'echo "DATABASE_URL=${POSNEXT_DATABASE_URL}" > .env'
      }
    }
    
    stage('Install dependencies') {
      steps {
        // Install project dependencies
        nodejs(nodeJSInstallationName: 'nodejs') {
            sh 'npm install'
        }
      }
    }
    
    stage('Build') {
      steps {
        // Build the project
        nodejs(nodeJSInstallationName: 'nodejs') {
            sh 'npm run build'
        }
      }
    }
  }
}
