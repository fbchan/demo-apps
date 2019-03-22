pipeline {
    agent any
    environment {
        APPS_NAME = "dapps01"
        FQDN = "dapps01.foobz.com.au"
        DOCKER_IMAGE_NAME = "foobz/demo-apps"
    }
    stages {
        stage('Build and Test Apps') {
            steps {
                echo 'Running build automation'
                sh './gradlew build --no-daemon'
                archiveArtifacts artifacts: 'dist/demo-apps.zip'
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
        }
        stage('Container Security Scan') {
            steps {
                sh 'echo "foobz/demo-apps `pwd`/Dockerfile" > anchore_images'
                anchore name: 'anchore_images'
            }
        }
        stage('Container Clean Up') {
            steps {
                sh'''
                    for i in `cat anchore_images | awk '{print $1}'`;do docker rmi $i; done
                '''
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
        }
        stage('DeployAppServices') {
            steps {
                // Deploy Application Services test
                milestone(3)
                build (job: "blue-apps-services-http", 
                       parameters: 
                       [string(name: 'FQDN', value: FQDN),
                       string(name: 'APPS_NAME', value: APPS_NAME)])
            }
        }
    }
}
