const express = require("express"); // Express cho phép tạo server
const cors = require("cors"); // chỉ cho phép gọi api tử  http://localhost:${PORT}/v1/responses
const axios = require("axios"); // gọi api tới openai (api là phương thức giao tiếp của openai)
const dotenv = require("dotenv"); // Đẩy dự án lên github cần giấu key api, nên dùng file .evn để lưu key api, github không hiện file .evn. dotevn dùng để đọc key api của file .evn

// 🔐 Load biến môi trường từ .env
dotenv.config(); //Giúp bạn dùng được process.env.OPENAI_API_KEY hoặc PORT

const app = express(); // Tạo server
const PORT = process.env.PORT || 3000; // Gán cổng port từ file .evn, nếu trong .evn không có thì mặc định dùng 3000

// 🔁 Cho phép các request từ trình duyệt
app.use(cors()); // cho phép app gọi api
app.use(express.json()); // cho phép đọc dữ liệu json

// 📂 Phục vụ file tĩnh trong thư mục "public"
app.use(express.static("public")); // Liên kết tới public để sử dụng tệp html, css, script.

// 🔁 Endpoint để proxy yêu cầu từ client đến OpenAI
app.post("/v1/responses", async (req, res) => {
  const { input, model } = req.body; // input: dữ liệu người dùng gửi lên, model: model sử dụng

  try {
    const response = await axios.post(
      // gửi yêu cầu post tới api của gpt
      "https://api.openai.com/v1/chat/completions", // liên kết đến api của gpt
      {
        model: model || "gpt-3.5-turbo", // Nếu không khai báo model thì mặc định dùng "gpt - 3.5 - turbo"
        messages: input, // Đoạn tin nhắn người dùng gửi
        temperature: 0.7, // độ sáng tạo của gpt
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, // Gửi api key từ file .evn
          "Content-Type": "application/json", // Kiểu dữ liệu là json
        },
      }
    );

    const output = response.data.choices.map((choice) => ({
      // Lấy nội dung từ gpt gửi về
      content: [{ text: choice.message.content }], // Định dạng lại nội dung
    }));

    res.json({ output }); // Gửi phản hồi về người dùng
  } catch (error) {
    // bắt lỗi, in ra màn hình
    console.error("❌ Lỗi proxy:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: "Lỗi khi gọi API OpenAI",
      details: error.response?.data || error.message,
    });
  }
});

// 🚀 Bắt đầu server
app.listen(PORT, () => {
  console.log(`✅ Proxy đang chạy tại http://localhost:${PORT}/v1/responses`);
});
