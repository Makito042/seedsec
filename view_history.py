#!/usr/bin/env python3
import os
import json
import urllib.parse
from http.server import HTTPServer, BaseHTTPRequestHandler
from datetime import datetime

BRAIN_DIRS = [
    "/Users/mac/.gemini/antigravity-ide/brain",
    "/Users/mac/.gemini/antigravity/brain",
    "/Users/mac/.gemini/antigravity-backup/brain"
]

HTML_CONTENT = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Antigravity Chat History Viewer</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-main: #0b0f19;
            --bg-sidebar: #131926;
            --bg-card: #172033;
            --border-color: rgba(255, 255, 255, 0.08);
            --text-primary: #f8fafc;
            --text-secondary: #94a3b8;
            --primary-accent: #6366f1;
            --primary-gradient: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
            --bubble-user: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
            --bubble-ai: rgba(30, 41, 59, 0.45);
        }

        body {
            margin: 0;
            padding: 0;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background-color: var(--bg-main);
            color: var(--text-primary);
            display: flex;
            height: 100vh;
            overflow: hidden;
        }

        .sidebar {
            width: 340px;
            background-color: var(--bg-sidebar);
            border-right: 1px solid var(--border-color);
            display: flex;
            flex-direction: column;
            height: 100%;
            z-index: 10;
        }

        .sidebar-header {
            padding: 24px 20px;
            border-bottom: 1px solid var(--border-color);
        }

        .sidebar-header h1 {
            font-family: 'Outfit', sans-serif;
            font-size: 1.3rem;
            margin: 0;
            background: linear-gradient(90deg, #818cf8, #c084fc);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .search-box {
            padding: 15px 20px;
            border-bottom: 1px solid var(--border-color);
        }

        .search-input {
            width: 100%;
            padding: 12px 14px;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid var(--border-color);
            border-radius: 10px;
            color: var(--text-primary);
            font-size: 0.9rem;
            outline: none;
            box-sizing: border-box;
            transition: all 0.2s ease;
        }

        .search-input:focus {
            border-color: var(--primary-accent);
            background: rgba(255, 255, 255, 0.08);
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
        }

        .chat-list {
            flex: 1;
            overflow-y: auto;
            padding: 12px;
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }
        ::-webkit-scrollbar-track {
            background: transparent;
        }
        ::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.2);
        }

        .chat-item {
            padding: 14px 16px;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.2s ease;
            border: 1px solid transparent;
            background: transparent;
            text-align: left;
        }

        .chat-item:hover {
            background: rgba(255, 255, 255, 0.03);
        }

        .chat-item.active {
            background: rgba(99, 102, 241, 0.1);
            border-color: rgba(99, 102, 241, 0.2);
        }

        .chat-item-time {
            font-size: 0.75rem;
            color: var(--text-secondary);
            margin-bottom: 6px;
        }

        .chat-item-preview {
            font-size: 0.85rem;
            color: #e2e8f0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .main-area {
            flex: 1;
            display: flex;
            flex-direction: column;
            height: 100%;
            background: radial-gradient(circle at 50% 50%, #0e1628 0%, #070a12 100%);
            position: relative;
        }

        .chat-header {
            padding: 20px 30px;
            border-bottom: 1px solid var(--border-color);
            background: rgba(19, 25, 38, 0.4);
            backdrop-filter: blur(12px);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .chat-header-info h2 {
            margin: 0 0 4px 0;
            font-size: 1.15rem;
            font-family: 'Outfit', sans-serif;
        }

        .chat-header-info p {
            margin: 0;
            font-size: 0.8rem;
            color: var(--text-secondary);
        }

        .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 30px;
            display: flex;
            flex-direction: column;
            gap: 24px;
        }

        .message-wrapper {
            display: flex;
            flex-direction: column;
            width: 100%;
        }

        .message {
            max-width: 80%;
            padding: 18px 22px;
            border-radius: 14px;
            font-size: 0.95rem;
            line-height: 1.6;
            box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.2);
            position: relative;
        }

        .message.user {
            align-self: flex-end;
            background: var(--bubble-user);
            color: #ffffff;
            border-bottom-right-radius: 2px;
        }

        .message.assistant {
            align-self: flex-start;
            background: var(--bubble-ai);
            border: 1px solid var(--border-color);
            backdrop-filter: blur(8px);
            color: #e2e8f0;
            border-bottom-left-radius: 2px;
        }

        .message-meta {
            font-size: 0.75rem;
            color: var(--text-secondary);
            margin-top: 8px;
            display: flex;
            gap: 10px;
        }

        .message.user .message-meta {
            justify-content: flex-end;
            color: rgba(255, 255, 255, 0.7);
        }

        .tool-events-container {
            margin-top: 10px;
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .tool-event {
            font-family: monospace;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            padding: 6px 12px;
            font-size: 0.8rem;
            color: var(--text-secondary);
            display: inline-flex;
            align-items: center;
            gap: 8px;
            align-self: flex-start;
        }

        .welcome-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            text-align: center;
            padding: 40px;
        }

        .welcome-icon {
            font-size: 3.5rem;
            margin-bottom: 24px;
            background: linear-gradient(135deg, #818cf8, #c084fc);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .welcome-container h2 {
            font-family: 'Outfit', sans-serif;
            margin: 0 0 10px 0;
            font-size: 1.8rem;
        }

        .welcome-container p {
            color: var(--text-secondary);
            max-width: 440px;
            line-height: 1.6;
            margin: 0;
        }

        /* Markdown Code Styles */
        .code-container {
            background: #070a13;
            border: 1px solid var(--border-color);
            border-radius: 10px;
            margin: 14px 0;
            overflow: hidden;
        }

        .code-header {
            background: rgba(255, 255, 255, 0.02);
            padding: 8px 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--border-color);
        }

        .code-lang {
            font-family: monospace;
            font-size: 0.75rem;
            color: var(--text-secondary);
            text-transform: uppercase;
            font-weight: 500;
        }

        .copy-btn {
            background: transparent;
            border: 1px solid var(--border-color);
            color: var(--text-secondary);
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 0.75rem;
            cursor: pointer;
            transition: all 0.2s;
            outline: none;
        }

        .copy-btn:hover {
            background: rgba(255, 255, 255, 0.05);
            color: var(--text-primary);
            border-color: rgba(255, 255, 255, 0.2);
        }

        .copy-btn.copied {
            background: #10b981;
            color: #ffffff;
            border-color: #10b981;
        }

        pre {
            margin: 0;
            padding: 16px;
            overflow-x: auto;
        }

        code {
            font-family: 'Fira Code', Consolas, Monaco, monospace;
            font-size: 0.88rem;
        }

        p {
            margin: 0 0 12px 0;
        }

        p:last-child {
            margin-bottom: 0;
        }

        ul, ol {
            margin: 0 0 12px 0;
            padding-left: 20px;
        }

        li {
            margin-bottom: 6px;
        }

        h1, h2, h3 {
            font-family: 'Outfit', sans-serif;
            margin: 20px 0 12px 0;
            font-weight: 600;
        }

        h1 { font-size: 1.5rem; }
        h2 { font-size: 1.3rem; }
        h3 { font-size: 1.1rem; }

        .spacer {
            height: 12px;
        }
    </style>
</head>
<body>

    <div class="sidebar">
        <div class="sidebar-header">
            <h1><span>🛸</span> Antigravity Chats</h1>
        </div>
        <div class="search-box">
            <input type="text" id="searchInput" class="search-input" placeholder="Search conversations...">
        </div>
        <div class="chat-list" id="chatList">
            <!-- Loaded dynamically -->
        </div>
    </div>

    <div class="main-area" id="mainArea">
        <div class="welcome-container">
            <div class="welcome-icon">💬</div>
            <h2>Chat History Viewer</h2>
            <p>Select a chat session from the sidebar to view the full dialogue transcript, code artifacts, and tool executions.</p>
        </div>
    </div>

    <script>
        let allChats = [];

        async function loadChats() {
            try {
                const response = await fetch('/api/chats');
                allChats = await response.json();
                renderChatList(allChats);
            } catch (error) {
                console.error("Error fetching chats:", error);
            }
        }

        function renderChatList(chats) {
            const listContainer = document.getElementById('chatList');
            listContainer.innerHTML = '';
            
            if (chats.length === 0) {
                listContainer.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text-secondary); font-size:0.85rem;">No chats found</div>';
                return;
            }

            chats.forEach(chat => {
                const item = document.createElement('div');
                item.className = 'chat-item';
                item.dataset.id = chat.id;
                
                const date = new Date(chat.timestamp);
                const formattedDate = date.toLocaleDateString(undefined, { 
                    month: 'short', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });

                item.innerHTML = `
                    <div class="chat-item-time">${formattedDate}</div>
                    <div class="chat-item-preview">${escapeHtml(chat.preview)}</div>
                `;

                item.addEventListener('click', () => selectChat(chat.id));
                listContainer.appendChild(item);
            });
        }

        function escapeHtml(text) {
            if (!text) return "";
            return text
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");
        }

        function renderMarkdown(text) {
            if (!text) return "";
            
            let html = escapeHtml(text);
                
            // 1. Fenced Code blocks
            const codeBlocks = [];
            html = html.replace(/```(\\w*)\\n([\\s\\S]*?)```/g, function(match, lang, code) {
                const id = "code-placeholder-" + codeBlocks.length;
                codeBlocks.push({
                    lang: lang || "code",
                    code: code.trim()
                });
                return id;
            });
            
            // 2. Headings
            html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
                       .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                       .replace(/^# (.*$)/gim, '<h1>$1</h1>');
                       
            // 3. Bold & Italic
            html = html.replace(/\\*\\*([\\s\\S]*?)\\*\\*/g, '<strong>$1</strong>')
                       .replace(/\\*([\\s\\S]*?)\\*/g, '<em>$1</em>');
                       
            // 4. Inline code
            html = html.replace(/`([^`\\n]+)`/g, '<code>$1</code>');
            
            // 5. Links
            html = html.replace(/\\[([^\\]]+)\\]\\(([^)]+)\\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
            
            // 6. Split into paragraphs/lists
            const lines = html.split('\n');
            let inList = false;
            let processedLines = [];
            
            for (let line of lines) {
                let trimmed = line.trim();
                if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                    if (!inList) {
                        processedLines.push('<ul>');
                        inList = true;
                    }
                    processedLines.push('<li>' + trimmed.substring(2) + '</li>');
                } else {
                    if (inList) {
                        processedLines.push('</ul>');
                        inList = false;
                    }
                    if (trimmed === "") {
                        processedLines.push('<div class="spacer"></div>');
                    } else if (!trimmed.startsWith('<h') && !trimmed.startsWith('<ul') && !trimmed.startsWith('<li') && !trimmed.startsWith('code-placeholder-')) {
                        processedLines.push('<p>' + line + '</p>');
                    } else {
                        processedLines.push(line);
                    }
                }
            }
            if (inList) {
                processedLines.push('</ul>');
            }
            
            html = processedLines.join('\n');
            
            // Restore code blocks
            codeBlocks.forEach((block, index) => {
                const placeholder = "code-placeholder-" + index;
                // Convert back HTML entities for the raw clipboard copy
                const rawCode = block.code
                    .replace(/&amp;/g, "&")
                    .replace(/&lt;/g, "<")
                    .replace(/&gt;/g, ">");
                
                const blockHtml = `
                    <div class="code-container">
                        <div class="code-header">
                            <span class="code-lang">${block.lang}</span>
                            <button class="copy-btn" onclick="copyCode(this)">Copy</button>
                        </div>
                        <pre><code class="language-${block.lang}">${block.code}</code></pre>
                        <div style="display:none" class="raw-code">${escapeHtml(rawCode)}</div>
                    </div>
                `;
                html = html.replace(placeholder, blockHtml);
            });
            
            return html;
        }

        function copyCode(btn) {
            const container = btn.closest('.code-container');
            const rawCode = container.querySelector('.raw-code').textContent;
            navigator.clipboard.writeText(rawCode).then(() => {
                btn.textContent = "Copied!";
                btn.classList.add('copied');
                setTimeout(() => {
                    btn.textContent = "Copy";
                    btn.classList.remove('copied');
                }, 2000);
            });
        }

        async function selectChat(chatId) {
            // Update active states in sidebar
            document.querySelectorAll('.chat-item').forEach(item => {
                item.classList.toggle('active', item.dataset.id === chatId);
            });

            const mainArea = document.getElementById('mainArea');
            mainArea.innerHTML = `
                <div style="display:flex; justify-content:center; align-items:center; height:100%;">
                    <div style="color:var(--text-secondary);">Loading conversation...</div>
                </div>
            `;

            try {
                const response = await fetch(`/api/chat/${chatId}`);
                const transcript = await response.json();
                renderChat(chatId, transcript);
            } catch (error) {
                mainArea.innerHTML = `
                    <div style="display:flex; justify-content:center; align-items:center; height:100%;">
                        <div style="color:#ef4444;">Error loading conversation transcript.</div>
                    </div>
                `;
            }
        }

        function renderChat(chatId, transcript) {
            const mainArea = document.getElementById('mainArea');
            const chatMeta = allChats.find(c => c.id === chatId);
            const formattedDate = chatMeta ? new Date(chatMeta.timestamp).toLocaleString() : '';

            mainArea.innerHTML = `
                <div class="chat-header">
                    <div class="chat-header-info">
                        <h2>Session: ${chatId.substring(0, 8)}...</h2>
                        <p>Started on ${formattedDate}</p>
                    </div>
                    <div style="font-size: 0.8rem; color: var(--text-secondary); background: rgba(255,255,255,0.05); padding: 6px 12px; border-radius: 6px; border: 1px solid var(--border-color);">
                        ID: ${chatId}
                    </div>
                </div>
                <div class="chat-messages" id="messagesContainer">
                    <!-- Loaded dynamically -->
                </div>
            `;

            const container = document.getElementById('messagesContainer');
            
            transcript.forEach(msg => {
                if (msg.role === 'user' || msg.role === 'assistant') {
                    const msgWrapper = document.createElement('div');
                    msgWrapper.className = 'message-wrapper';
                    
                    const msgDiv = document.createElement('div');
                    msgDiv.className = `message ${msg.role}`;
                    
                    const label = msg.role === 'user' ? '👤 User' : '🤖 Assistant';
                    const time = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : '';

                    msgDiv.innerHTML = `
                        <div style="font-weight: 600; margin-bottom: 6px; font-size: 0.8rem; opacity: 0.8;">${label}</div>
                        <div>${renderMarkdown(msg.content)}</div>
                        <div class="message-meta">
                            <span>${time}</span>
                        </div>
                    `;

                    msgWrapper.appendChild(msgDiv);
                    
                    // Render tool logs if any associated with this model turn
                    if (msg.tool_calls && msg.tool_calls.length > 0) {
                        const toolsContainer = document.createElement('div');
                        toolsContainer.className = 'tool-events-container';
                        
                        msg.tool_calls.forEach(tc => {
                            const eventDiv = document.createElement('div');
                            eventDiv.className = 'tool-event';
                            eventDiv.innerHTML = `🔧 Tool call: ${tc.name}`;
                            toolsContainer.appendChild(eventDiv);
                        });
                        msgWrapper.appendChild(toolsContainer);
                    }
                    
                    container.appendChild(msgWrapper);
                } else if (msg.role === 'system') {
                    const eventDiv = document.createElement('div');
                    eventDiv.className = 'tool-event';
                    eventDiv.style.alignSelf = 'center';
                    eventDiv.innerHTML = `⚙️ System Event: ${escapeHtml(msg.content)}`;
                    container.appendChild(eventDiv);
                }
            });

            // Scroll to bottom
            container.scrollTop = container.scrollHeight;
        }

        // Live Search Filtering
        document.getElementById('searchInput').addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = allChats.filter(chat => 
                chat.id.toLowerCase().includes(query) || 
                chat.preview.toLowerCase().includes(query)
            );
            renderChatList(filtered);
        });

        // Initialize
        loadChats();
    </script>
</body>
</html>
"""

class ChatHistoryHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        # Prevent spamming the terminal with logs
        pass

    def do_GET(self):
        parsed_path = urllib.parse.urlparse(self.path)
        path = parsed_path.path

        if path == "/":
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(HTML_CONTENT.encode("utf-8"))
        elif path == "/api/chats":
            chats = self.get_chats()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(chats).encode("utf-8"))
        elif path.startswith("/api/chat/"):
            chat_id = path.split("/")[-1]
            chat_id = os.path.basename(chat_id) # sanitization
            transcript = self.get_chat_transcript(chat_id)
            if transcript is not None:
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps(transcript).encode("utf-8"))
            else:
                self.send_response(404)
                self.end_headers()
                self.wfile.write(b"Chat not found")
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b"Not found")

    def get_chats(self):
        chats = []
        for brain_dir in BRAIN_DIRS:
            if not os.path.exists(brain_dir):
                continue
            for folder in os.listdir(brain_dir):
                folder_path = os.path.join(brain_dir, folder)
                if not os.path.isdir(folder_path):
                    continue
                transcript_path = os.path.join(folder_path, ".system_generated", "logs", "transcript.jsonl")
                if os.path.exists(transcript_path):
                    first_user_request = ""
                    first_timestamp = ""
                    try:
                        with open(transcript_path, 'r', encoding='utf-8') as f:
                            for line in f:
                                try:
                                    data = json.loads(line)
                                    if not first_timestamp and "created_at" in data:
                                        first_timestamp = data["created_at"]
                                    if data.get("source") == "USER_EXPLICIT" or data.get("type") == "USER_INPUT":
                                        content = data.get("content", "")
                                        if "<USER_REQUEST>" in content:
                                            content = content.split("<USER_REQUEST>")[1].split("</USER_REQUEST>")[0].strip()
                                        first_user_request = content
                                        break
                                except Exception:
                                    continue
                    except Exception:
                        pass
                    if not first_timestamp:
                        stat = os.stat(transcript_path)
                        first_timestamp = datetime.fromtimestamp(stat.st_mtime).isoformat()
                    if "antigravity-backup/brain" in brain_dir:
                        source_label = "Backup"
                    elif "antigravity/brain" in brain_dir:
                        source_label = "Old"
                    else:
                        source_label = "IDE"
                    chats.append({
                        "id": folder,
                        "timestamp": first_timestamp,
                        "preview": f"[{source_label}] " + (first_user_request[:110].replace('\n', ' ') if first_user_request else "(No user messages found)")
                    })
        chats.sort(key=lambda x: x["timestamp"], reverse=True)
        return chats

    def get_chat_transcript(self, chat_id):
        for brain_dir in BRAIN_DIRS:
            transcript_path = os.path.join(brain_dir, chat_id, ".system_generated", "logs", "transcript.jsonl")
            if os.path.exists(transcript_path):
                messages = []
                try:
                    with open(transcript_path, 'r', encoding='utf-8') as f:
                        for line in f:
                            try:
                                data = json.loads(line)
                                source = data.get("source")
                                msg_type = data.get("type")
                                content = data.get("content", "")
                                timestamp = data.get("created_at") or data.get("timestamp")
                                
                                if source == "USER_EXPLICIT" or msg_type == "USER_INPUT":
                                    role = "user"
                                    if "<USER_REQUEST>" in content:
                                        content = content.split("<USER_REQUEST>")[1].split("</USER_REQUEST>")[0].strip()
                                elif source == "MODEL" and msg_type == "PLANNER_RESPONSE":
                                    role = "assistant"
                                elif source == "SYSTEM" or msg_type == "SYSTEM":
                                    role = "system"
                                else:
                                    continue
                                
                                messages.append({
                                    "role": role,
                                    "content": content,
                                    "timestamp": timestamp,
                                    "tool_calls": data.get("tool_calls", [])
                                })
                            except Exception:
                                continue
                    return messages
                except Exception:
                    return None
        return None

def main():
    port = 8000
    server_address = ('', port)
    httpd = HTTPServer(server_address, ChatHistoryHandler)
    print("=" * 60)
    print("🛸 Antigravity Chat History Viewer is running!")
    print(f"👉 Open in your web browser: http://localhost:{port}")
    print("=" * 60)
    print("Press Ctrl+C to stop the server.")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping Chat History Viewer server...")

if __name__ == '__main__':
    main()
