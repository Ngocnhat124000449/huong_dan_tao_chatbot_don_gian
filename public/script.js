const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const messages = document.getElementById("messages");

// Lịch sử hội thoại
const chatHistory = [
  // Hướng dẫn gpt cách phản hồi (cấu hình cho gpt)
  {
    role: "system",
    content: `
  Bạn là một Cố vấn học tập AI cá nhân, chuyên hỗ trợ sinh viên khám phá tiềm năng, định hướng học tập và phát triển bản thân.

Mục tiêu:
- Thu thập thông tin về sinh viên một cách tự nhiên qua trò chuyện.
- Dùng thông tin đó để phân tích, đánh giá và đưa ra kế hoạch học tập cá nhân hóa.
- Giúp sinh viên cảm thấy được lắng nghe, động viên, và có lộ trình rõ ràng.

Cách giao tiếp:
- Nói chuyện thân thiện, gần gũi, khuyến khích chia sẻ.
- Không hỏi quá dồn dập. Hãy đặt câu hỏi từng bước, dựa trên câu trả lời trước.
- Xen kẽ phản hồi cảm xúc, lời khích lệ, và câu hỏi tiếp theo.
- Dẫn dắt cuộc trò chuyện như một câu chuyện, khiến sinh viên cảm thấy bạn quan tâm thật sự.

Thông tin cần thu thập (hỏi dần dần):
1. Thông tin cá nhân cơ bản: tên, ngành học, năm học.
2. Mục tiêu ngắn hạn và dài hạn trong học tập.
3. Môn học hoặc kỹ năng mà sinh viên yêu thích hoặc muốn cải thiện.
4. Phương pháp học tập hiện tại và mức độ hiệu quả.
5. Thói quen học tập hằng ngày và thời gian rảnh.
6. Những khó khăn hoặc rào cản đang gặp phải.
7. Nguồn tài liệu hoặc hỗ trợ mà sinh viên mong muốn.
8. Mức độ tự tin vào khả năng học tập.
9. Sở thích và định hướng nghề nghiệp trong tương lai.

Yêu cầu:
- Sau khi có đủ thông tin, hãy tổng hợp phân tích và đề xuất lộ trình học tập cá nhân hóa.
- Nếu sinh viên chưa sẵn sàng trả lời câu hỏi, hãy trò chuyện thoải mái trước.
- Luôn giữ ngôn ngữ tiếng Việt, rõ ràng và dễ hiểu.
- Luôn đặt câu hỏi mở, khuyến khích sinh viên chia sẻ nhiều hơn.
- Luôn nhớ rằng mỗi sinh viên là một cá thể khác nhau, không áp đặt khuôn mẫu.

      `,
  },
  {
    role: "user", // Tin nhắn tự gửi để tạo cảm giác gpt như một cố vấn thật, cuộc trò chuyện tự nhiên hơn.
    content: "Chào bạn!",
  },
];

// Hàm hiển thị tin nhắn
function addMessage(text, sender) {
  const div = document.createElement("div");
  div.className = `message ${sender}`;
  div.innerHTML = text.replace(/\n/g, "<br>");

  messages.appendChild(div);

  // Đợi DOM cập nhật xong rồi mới cuộn
  setTimeout(() => {
    messages.scrollTop = messages.scrollHeight;
  }, 0);

  return div;
}

// Gửi tin nhắn đến server và xử lý phản hồi
async function sendToGPT() {
  const botDiv = addMessage("Đang suy nghĩ...", "bot");

  try {
    const response = await fetch("/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        input: chatHistory,
      }),
    });

    const json = await response.json();
    const output_text =
      json?.output?.[0]?.content?.[0]?.text ||
      "⚠️ Không có phản hồi từ chatbot.";

    botDiv.innerHTML = ""; // Xóa dấu "..."
    typeText(botDiv, output_text); // Gõ từng chữ

    chatHistory.push({ role: "assistant", content: output_text });
  } catch (error) {
    botDiv.textContent = "❌ Lỗi: " + error.message;
  }
}

// Khởi động khi trang load
window.addEventListener("DOMContentLoaded", () => {
  sendToGPT();
});

// Gửi khi người dùng nhập
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userMessage = input.value.trim();
  if (!userMessage) return;

  input.value = "";
  addMessage(userMessage, "user");
  chatHistory.push({ role: "user", content: userMessage });

  sendToGPT();
});

const userInput = document.getElementById("user-input");

userInput.addEventListener("input", () => {
  userInput.style.height = "auto"; // reset
  userInput.style.height = userInput.scrollHeight + "px";
});

userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    form.requestSubmit();
  }
});
function typeText(element, text, speed = 50) {
  let i = 0;
  function typing() {
    if (i < text.length) {
      const char = text[i] === "\n" ? "<br>" : text[i];
      element.innerHTML += char;
      messages.scrollTop = messages.scrollHeight;
      i++;
      setTimeout(typing, speed);
    }
  }
  typing();
}
