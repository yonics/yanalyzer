const express = require('express')
const axios = require('axios')
require('dotenv').config();

const app = express()

app.get('/youtubesearch', (req, res) => {

   axios({
        method: 'GET',
        baseURL: 'https://www.googleapis.com/youtube/v3/search',
        params: {
            part: "snippet",
            maxResults: 5,
            q: "cool",
            key: process.env.YOUTUBE_KEY
          }
      })
      .then(response => {
        const snippetRaw = response.data.items;
        const snippetData = snippetRaw.map(singleSnippet => {
           const {snippet, id} = singleSnippet;
           const videoId = id.videoId;
           return {videoId, ...snippet};
        })
        
        axios({
            method: 'GET',
            baseURL: 'https://www.googleapis.com/youtube/v3/videos',
            params: {
                part: "statistics",
                id: response.data.items.map(video => video.id.videoId).toString(),
                key: process.env.YOUTUBE_KEY
              }
          })
          .then( statisticsData => res.json(statisticsData.data.items.map((videoStatistics, i) => {
              const videoStats=videoStatistics.statistics;
              const snippetDataUnArray = snippetData[i];
              const merge = { ...snippetDataUnArray, videoStats}
              return merge;
            })))
          .catch(err => console.log("Error getting statistics: " + err))
    })
    .catch(error => console.log("Error getting snippet: " + error));
    
})
      
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})