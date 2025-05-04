import axios from "axios";
import logger from "../logger/index.js"

export const getJudge0LanguageId = (language) =>{
    const languagesMap = {
        "JAVA":62,
        "JAVASCRIPT": 63,
        "PYTHON": 71,
    };

    return languagesMap[language.toUpperCase()];
}

export const submitBatch = async(submissions) => {
    const {data} = await axios.post(`${process.env.JUDGE0_API_URL}/submissions/batch?base64_encoded=true`, {submissions});

    logger.info(`Data: ${data}`);

    return data;
}

const sleep = (ms) => {
    return new Promise((resolve)=>(setTimeout(resolve, ms)));
}

export const poolBatchResults = async(tokens) => {
    while(true){
        const {data} = await axios.post(`${process.env.JUDGE0_API_URL}/submissions/batch`, {
            params:{
                tokens:tokens.join(","),
                base64_encoded:true
            }
        });

        const results = data.submissions;

        const isAllDone = results.every((result)=>(result.status.id !==1 && result.status.id !== 2));

        if(isAllDone){
            return results;
        }

        await sleep(1000);
    }
}

// export const  = async() => {
//     const options = {
//         method,
//         url,
//         headers: {
//         "x-rapidapi-key": process.env.RAPID_API_KEY,
//         "x-rapidapi-host": process.env.RAPID_API_HOST,
//         },
//     };

//     try {
//         const response = await axios.request(options);
//         console.log(response.data);
//     } catch (error) {
//         console.error(error);
//     }
// };