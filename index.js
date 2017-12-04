const { exec } = require('child_process');

const SLACK_API_TOKEN = process.env.npm_package_config_slack_api_token
const GCLOUD_ACCOUNT_KEY_FILE = process.env.npm_package_config_gcloud_service_account_file
const GCLOUD_PROJECT_ID = process.env.npm_package_config_gcloud_project_id
const IMAGE_FILE_PATH = './captured.jpeg'

exec(`fswebcam -D 2 -r 1280x720 ${IMAGE_FILE_PATH}`, (err, stdout, stderr) => {
  console.log(err)
})

const client= require('google-cloud');
const vision = client.vision({
  projectId: GCLOUD_PROJECT_ID,
  keyFilename: GCLOUD_ACCOUNT_KEY_FILE
});
vision.labelDetection({ source: { filename: IMAGE_FILE_PATH} })
  .then((results) => {
    const labels = results[0].labelAnnotations;
    labels.forEach((label) => {
      if(label.mid === '/m/027g6wt') {
        sendSlack();
      }
    });
  })
  .catch((err) => {
    console.error('ERROR:', err);
  });

function sendSlack() {
  const fs = require('fs');
  const Slack = require('node-slack-upload');
  const slack = new Slack(SLACK_API_TOKEN);
  slack.uploadFile({
    file: fs.createReadStream(IMAGE_FILE_PATH),
    filetype: 'json',
    title: 'README',
    initialComment: 'my comment',
    channels: '@shouhei.tai'
  }, function(err, data) {
    if (err) {
      console.error(err);
    }
    else {
      console.log('Uploaded file details: ', data);
    }
  });
}
