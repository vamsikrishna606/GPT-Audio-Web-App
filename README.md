# GPT-Audio-Web-App

 Built a bot using Node.js which accepts and processes voice input from a web application. 

Implementation 
1. Implemented a voice-based user interface on the web application where users can speak their queries. 

Speech to Text Functionality
2. Implemented speech-to-text functionality which converts the voice input from the web application into text. This project uses Assembly AI API which provides speech-to-text functionality by adding the API key provided by Assembly AI the API key is a paid version.

3. The bot should recognize the silence after the user stops speaking as a trigger to start processing the voice input. 

Pass the converted text into GPT 
4. Pass the output text to GPT. This project uses open AI (GPT) for processing the text and receives the response.

Speech to user
5. Implement text-to-speech functionality which converts the GPT response into speech, and returns this audio response to the user through the web application once the input has been processed.
