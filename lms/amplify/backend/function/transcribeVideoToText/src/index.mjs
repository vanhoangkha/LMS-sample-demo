import {
  TranscribeClient,
  StartTranscriptionJobCommand,
} from "@aws-sdk/client-transcribe";

const REGION = "ap-southeast-1";
const transcribeClient = new TranscribeClient();

export const handler = async (event) => {
  console.log(event.Records[0].s3);
  console.log(event);
  const sourceBucketName = event.Records[0].s3.bucket.name;
  const key = event.Records[0].s3.object.key;

  if (
    event.Records[0].eventName.includes("ObjectCreated") &&
    key.includes("public/lecture-videos/")
  ) {
    let jobName = key.split("/")[2];
    jobName = jobName.split(".")[0];
    jobName = jobName.replace(/[^a-zA-Z ]/g, "");
    
    const params = {
      TranscriptionJobName: jobName,
      Media: {
        MediaFileUri: `https://${sourceBucketName}.s3.${REGION}.amazonaws.com/${key}`,
        // For example, "https://transcribe-demo.s3-REGION.amazonaws.com/hello_world.wav"
      },
      IdentifyLanguage: true,
      OutputBucketName: sourceBucketName,
      OutputKey: "public/transcription/",
    };

    try {
      const data = await transcribeClient.send(
        new StartTranscriptionJobCommand(params)
      );
      console.log("Success - put", data);
      return data; // For unit tests.
    } catch (err) {
      console.log("Error", err);
    }
  }
};
