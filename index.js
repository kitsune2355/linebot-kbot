'use strict';

const express = require('express');

const axios = require('axios');
const line = require('@line/bot-sdk');
const https = require('https')

// create LINE SDK config from env variables
const config = {
  channelAccessToken: "Z/IjmXD5vq88LDO6VmjU7U61tI9U04j10vzLK7A5CzXiPbW7OqH8Bjjc/w2wWpfXoKK7PxijQt9vASevUB5n7zA5G7x1UUkksRMhPGM6Xd1PTFIM3ytynkKuu8H1eNU2K/n2dF/AI7nz7Rfj41k7dwdB04t89/1O/w1cDnyilFU=",
  channelSecret: "02dc394fb2eccfc96743341838ce06bb",
};

// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/callback', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

//event handler
 async function handleEvent(event) 
 {
  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text-message event
    return Promise.resolve(null);
  }
  else if (event.message.type == "text" && event.message.text == "ค้นหาคำสั่งซื้อ") {
    const payload = {
      type : "text",
      text : "เลขออเดอร์ของคุณคือ?"
    };
    return client.replyMessage(event.replyToken, payload);
  }
  else if(event.message.type == "text" && event.message.text.substring(0,3)== "OD-" ){
      
    axios.post(
      'https://podsable.com:4017/order-online-bill',
      {
          od_online_number: event.message.text,
          lang: 'th'
      },
      {
        httpsAgent : new https.Agent({rejectUnauthorized: false})
      }
    ).then((response)=>{
      
      //console.log(response)
      const payload = {
        // type : "text",
        // text : response.data.data[0].od_online_number,
        "type": "flex",
            "altText": "this is a Flex Message",
            "contents": {
              "type": "bubble",
            "hero": {
              "type": "image",
              "url": "https://www.afteryoudessertcafe.com/wp-content/themes/after-you/images/logo.jpg",
              "margin": "none",
              "size": "xl"
            },
            "body": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "text": response.data.data[0].od_online_number,
                  "weight": "bold",
                  "color": "#1DB446",
                  "size": "sm"
                },
                {
                  "type": "text",
                  "text": "สำนักงานใหญ่ 1319/9 ซ.พัฒนาการ 25 ถ.พัฒนาการ แขวงสวนหลวง เขตสวนหลวง",
                  "size": "xs",
                  "color": "#aaaaaa",
                  "wrap": true
                },
                {
                  "type": "separator",
                  "margin": "xxl"
                },
                {
                  "type": "box",
                  "layout": "vertical",
                  "margin": "xxl",
                  "spacing": "sm",
                  "contents": [
                    {
                      "type": "box",
                      "layout": "horizontal",
                      "contents": [
                        {
                          "type": "text",
                          "text": "ประเภทการรับสินค้า",
                          "size": "sm",
                          "color": "#555555",
                          "flex": 0
                        },
                        {
                          "type": "text",
                          "text": response.data.data[0].receive_channel,
                          "size": "sm",
                          "color": "#111111",
                          "align": "end"
                        }
                      ]
                    },
                    {
                      "type": "box",
                      "layout": "horizontal",
                      "contents": [
                        {
                          "type": "text",
                          "text": "สินค้าทั้งหมด",
                          "size": "sm",
                          "color": "#555555",
                          "flex": 0
                        }
                      ]
                    },
                    ...response.data.data[0].product.map((p)=>{ return {
                        type:"box",
                        layout:"horizontal",
                        contents:[
                          {
                            type: "text",
                            text: p.pr_name,
                            size: "sm",
                            color: "#555555",
                            flex: 0
                          },
                          {
                            type: "text",
                            text: p.price,
                            size: "sm",
                            color: "#111111",
                            align: "end"
                          }
                        ]
                      }}),
                    {
                      "type": "separator",
                      "margin": "xxl"
                    },
                    {
                      "type": "box",
                      "layout": "horizontal",
                      "contents": [
                        {
                          "type": "text",
                          "text": "ค่าส่ง",
                          "flex": 0,
                          "size": "sm",
                          "color": "#555555"
                        },
                        {
                          "type": "text",
                          "text": response.data.data[0].delivery_cost,
                          "size": "sm",
                          "color": "#111111",
                          "align": "end"
                        }
                      ]
                    },
                    {
                      "type": "box",
                      "layout": "horizontal",
                      "contents": [
                        {
                          "type": "text",
                          "text": "ส่วนลดค่าส่ง",
                          "flex": 0,
                          "color": "#555555",
                          "size": "sm"
                        },
                        {
                          "type": "text",
                          "text": response.data.data[0].discount_delievry_cost,
                          "align": "end",
                          "color": "#111111",
                          "size": "sm"
                        }
                      ]
                    },
                    {
                      "type": "box",
                      "layout": "horizontal",
                      "contents": [
                        {
                          "type": "text",
                          "text": "ราคาของออเดอร์",
                          "flex": 0,
                          "size": "sm",
                          "color": "#555555"
                        },
                        {
                          "type": "text",
                          "text": response.data.data[0].sum_price,
                          "size": "sm",
                          "color": "#111111",
                          "align": "end"
                        }
                      ]
                    },
                    {
                      "type": "box",
                      "layout": "horizontal",
                      "contents": [
                        {
                          "type": "text",
                          "text": "ช่องการการชำระ",
                          "flex": 0,
                          "size": "sm",
                          "color": "#555555"
                        },
                        {
                          "type": "text",
                          "text": response.data.data[0].payment_channel_name,
                          "size": "sm",
                          "color": "#111111",
                          "align": "end"
                        }
                      ]
                    }
                  ]
                },
                {
                  "type": "separator",
                  "margin": "xxl"
                },
                {
                  "type": "box",
                  "layout": "horizontal",
                  "contents": [
                    {
                      "type": "text",
                      "text": "ที่อยู่ที่จัดส่ง",
                      "size": "sm"
                    }
                  ]
                },
                {
                  "type": "box",
                  "layout": "horizontal",
                  "contents": [
                    {
                      "type": "text",
                      "text": response.data.data[0].mem_address,
                      "size": "sm",
                      "align": "center"
                    }
                  ]
                }
              ]
            },
            "styles": {
              "footer": {
                "separator": true
              }
            }
            }
      };
      return client.replyMessage(event.replyToken, payload);
      
    })
    // .catch((error)=>{
    //   //console.log(error)
    //   const payload = {
    //     type : "text",
    //     text : "ไม่พบข้อมูล"
    //   };
    //   return client.replyMessage(event.replyToken, payload);
    // })
  }
  else if (event.message.type == "text" && event.message.text == "ค้นหาที่อยู่ร้าน") {
    const payload = {
      type : "text",
      text : "พิมพ์สาขาที่คุณต้องการค้นหา"
    };
    return client.replyMessage(event.replyToken, payload);
  }
  else if (event.message.text){
      
    axios.post(
      'https://podsable.com:4016/branch/full/list_eatin',
      {
        lang: 'th',
        lat: '13.7760235',
        long: '100.5709834',
      },
      {
        httpsAgent : new https.Agent({rejectUnauthorized: false})
      }

    ).then((res)=>{
      const filterItem = res.data.data.filter((brance) => 
        brance.b_name == event.message.text
      )

    const payload = [
      {
        "type": "location",
        "title": filterItem[0].b_name,
        "address": filterItem[0].b_name, 
        "latitude": filterItem[0].b_lat,
        "longitude": filterItem[0].b_long
    }
  ]
    return client.replyMessage(event.replyToken, payload);
      
    })
  }
  else{
    const payload = {
      type : "text",
      text : "ไม่พบข้อมูล"
    };
    return client.replyMessage(event.replyToken, payload);
  }
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
