import markdown
from weasyprint import HTML, CSS

# Read the markdown file
with open('/root/.openclaw/workspace/claude-code-subagents-cn.md', 'r') as f:
    md_content = f.read()

# Convert markdown to HTML
html_body = markdown.markdown(md_content, extensions=['tables', 'fenced_code', 'codehilite'])

# Create full HTML document with styling
html_content = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
body {{
    font-family: "Helvetica Neue", Arial, "Microsoft YaHei", "PingFang SC", sans-serif;
    font-size: 12pt;
    line-height: 1.8;
    max-width: 800px;
    margin: 2cm auto;
    padding: 0 1cm;
    color: #333;
}}
h1 {{
    font-size: 24pt;
    color: #1a1a1a;
    border-bottom: 2px solid #0066cc;
    padding-bottom: 10px;
    margin-top: 30px;
}}
h2 {{
    font-size: 18pt;
    color: #1a1a1a;
    margin-top: 25px;
    border-bottom: 1px solid #ddd;
    padding-bottom: 5px;
}}
h3 {{
    font-size: 14pt;
    color: #333;
    margin-top: 20px;
}}
code {{
    background-color: #f5f5f5;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: "SF Mono", Monaco, Consolas, monospace;
    font-size: 10pt;
}}
pre {{
    background-color: #f5f5f5;
    padding: 15px;
    border-radius: 5px;
    overflow-x: auto;
    border-left: 4px solid #0066cc;
}}
pre code {{
    background-color: transparent;
    padding: 0;
}}
table {{
    border-collapse: collapse;
    width: 100%;
    margin: 15px 0;
}}
th, td {{
    border: 1px solid #ddd;
    padding: 8px 12px;
    text-align: left;
}}
th {{
    background-color: #f0f0f0;
    font-weight: bold;
}}
blockquote {{
    border-left: 4px solid #0066cc;
    margin: 15px 0;
    padding: 10px 15px;
    background-color: #f9f9f9;
}}
.warning {{
    background-color: #fff3cd;
    border-left: 4px solid #ffc107;
    padding: 10px 15px;
    margin: 15px 0;
}}
.note {{
    background-color: #e7f3ff;
    border-left: 4px solid #0066cc;
    padding: 10px 15px;
    margin: 15px 0;
}}
</style>
</head>
<body>
{html_body}
</body>
</html>"""

# Write HTML file
with open('/root/.openclaw/workspace/claude-code-subagents-cn.html', 'w') as f:
    f.write(html_content)

# Convert to PDF
HTML(filename='/root/.openclaw/workspace/claude-code-subagents-cn.html').write_pdf('/root/.openclaw/workspace/claude-code-subagents-cn.pdf')

print("PDF created successfully!")
