import { getVertexAI, getGenerativeModel } from "@firebase/vertexai-preview";
import { firebaseApp } from "./firebaseConfig";

const vertexAI = getVertexAI(firebaseApp);

// Initialize a generative model with a supported model
// The model name can be a string like "gemini-pro" or "gemini-pro-vision"
const model = getGenerativeModel(vertexAI, { model: "gemini-pro" });

export { model };
