// translator.js
const { OpenAIApi, Configuration } = require("openai");

const apiKey = process.env.APIKEY;
const config = new Configuration({ apiKey: apiKey });
const openai = new OpenAIApi(config);

async function translateMessage(originalText, selectedCountry) {
    try {
        const prompt = 'Translate the following text to ${selectedCountry}:\n${originalText}`;'
        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                { "role": "system", "content": prompt }
            ]
        });
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("Error in OpenAI translation:", error);
        return null; // Or handle the error as appropriate
    }
}

module.exports = { translateMessage };
