const fs = require("fs");
const pdf = require("pdf-parse");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();
const readline = require("readline");

// Initialize GoogleGenerativeAI with API key
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// Create readline interface
const userInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Display prompt
userInterface.prompt();

// Handle 'line' event
userInterface.on("line", handleInput);

let cvText = "";
let isFirstPrompt = true;

async function handleInput(input) {
  try {
    if (isFirstPrompt) {
      // Read the PDF file
      let dataBuffer = fs.readFileSync(
        "/mnt/c/Users/mohan/Downloads/Mohannad_CT-1.pdf",
      );

      // Extract text from the PDF file
      const data = await pdf(dataBuffer);

      // Analyze the CV
      const analysis = analyzeCV(data.text);
      console.log(analysis);

      // Prepare the text
      cvText = `${input}\n${data.text}`;
      isFirstPrompt = false;
    } else {
      cvText = input;
    }

    // Get generative model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Generate content stream
    const result = await model.generateContentStream([cvText]);

    // Log each chunk of text
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      console.log(chunkText);
    }
  } catch (error) {
    console.error(`An error occurred: ${error}`);
  }
}

function analyzeCV(text) {
  const skills = [
    "JavaScript",
    "Python",
    "Java",
    "C\\+\\+",
    "React",
    "Angular",
    "Node.js",
  ];
  let counts = {};

  for (let skill of skills) {
    let count = (text.match(new RegExp(skill, "gi")) || []).length;
    counts[skill] = count;
  }

  return counts;
}
