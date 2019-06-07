pipeline {
    agent any
    environment {
        APPS_NAME = "dsecapps01"
        FQDN = "dsecapps01.foobz.com.au"
        DOCKER_IMAGE_NAME = "foobz/demo-apps"
    }
    stages {
        stage('Build and Test Apps') {
            steps {
                echo 'Running build automation'
                sh './gradlew build --no-daemon'
                archiveArtifacts artifacts: 'dist/demo-apps.zip'
            }
            post {
                // only triggered when blue or green sign
                success {
                    slackSend (color: '#00FF00', message: "SUCCESSFUL: Build and Test Apps '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})")
                }
                // triggered when red sign
                failure {
                    slackSend (color: '#FF0000', message: "FAILED: Build and Test Apps '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})")
                }
            }
        }
        stage('Build Docker Image') {
            when {
                branch 'master'
            }
            steps {
                script {
                    app = docker.build(DOCKER_IMAGE_NAME)
                    app.inside {
                        sh 'echo Hello, World!'
                    }
                }
            }
            post {
                // only triggered when blue or green sign
                success {
                    slackSend (color: '#00FF00', message: "SUCCESSFUL: Build Docker Image '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})")
                }
                // triggered when red sign
                failure {
                    slackSend (color: '#FF0000', message: "FAILED: Build Docker Image '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})")
                }
            }
        }
        stage('Container Security Scan') {
            steps {
                sh 'echo "${DOCKER_IMAGE_NAME} `pwd`/Dockerfile" > anchore_images'
                anchore name: 'anchore_images'
            }
            post {
                // only triggered when blue or green sign
                success {
                    slackSend (color: '#00FF00', message: "SUCCESSFUL: Container Security Scan '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})")
                }
                // triggered when red sign
                failure {
                    slackSend (color: '#FF0000', message: "FAILED: Container Security Scan '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})")
                }
            }
        }
        stage('Push Docker Image') {
            when {
                branch 'master'
            }
            steps {
                script {
                    docker.withRegistry('https://registry.hub.docker.com', 'docker_hub_login') {
                        app.push("${env.BUILD_NUMBER}")
                        app.push("latest")
                    }
                }
            }
            post {
                // only triggered when blue or green sign
                success {
                    slackSend (color: '#00FF00', message: "SUCCESSFUL: Push Docker Image to Docker Hub '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})")
                }
                // triggered when red sign
                failure {
                    slackSend (color: '#FF0000', message: "FAILED: Push Docker Image to Docker Hub '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})")
                }
            }
        }
        stage('Deploy To Production - Cloud1') {
            when {
                branch 'master'
            }
            steps {
                milestone(1)
                kubernetesDeploy(
                    kubeconfigId: 'kubeconfig_cloud1',
                    configs: 'demo-apps-kube.yaml',
                    enableConfigSubstitution: true
                )
            }
            post {
                // only triggered when blue or green sign
                success {
                    slackSend (color: '#00FF00', message: "SUCCESSFUL: Deploy to Production - Cloud 1 '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})")
                }
                // triggered when red sign
                failure {
                    slackSend (color: '#FF0000', message: "FAILED: Deploy to Production - Cloud 1 '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})")
                }
            } 
        }
        stage('Deploy To Production - Cloud2') {
            when {
                branch 'master'
            }
            steps {
                milestone(2)
                kubernetesDeploy(
                    kubeconfigId: 'kubeconfig_cloud2',
                    configs: 'demo-apps-kube.yaml',
                    enableConfigSubstitution: true
                )
            }
            post {
                // only triggered when blue or green sign
                success {
                    slackSend (color: '#00FF00', message: "SUCCESSFUL: Deploy to Production - Cloud 2 '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})")
                }
                // triggered when red sign
                failure {
                    slackSend (color: '#FF0000', message: "FAILED: Deploy to Production - Cloud 2 '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})")
                }
            }
        }
        stage('DeployAppServices') {
            steps {
                // Deploy Application Services
                milestone(3)
                build (job: "ansible-blue-ea7-app-services", 
                       parameters: 
                       [string(name: 'FQDN', value: FQDN),
                       string(name: 'APPS_NAME', value: APPS_NAME)])
            }
            post {
                // only triggered when blue or green sign
                success {
                    slackSend (color: '#00FF00', message: "SUCCESSFUL: Provisioned apps onto F5 Apps Services Platform '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})")
                }
                // triggered when red sign
                failure {
                    slackSend (color: '#FF0000', message: "FAILED: Provisioned apps onto F5 Apps Services Platform '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})")
                }
            }
        }
    }
}
