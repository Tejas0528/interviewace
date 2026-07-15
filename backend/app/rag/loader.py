"""
Document loader for RAG pipeline.
Handles PDF, DOCX, TXT, and plain text.
"""
import os
from typing import List


class DocumentLoader:
    """Load documents from various file formats."""

    def load_pdf(self, file_path: str) -> str:
        try:
            import PyPDF2
            with open(file_path, "rb") as f:
                reader = PyPDF2.PdfReader(f)
                return "\n".join(
                    page.extract_text() for page in reader.pages if page.extract_text()
                )
        except Exception as e:
            print(f"PDF load error: {e}")
            return ""

    def load_docx(self, file_path: str) -> str:
        try:
            from docx import Document
            doc = Document(file_path)
            return "\n".join(para.text for para in doc.paragraphs if para.text)
        except Exception as e:
            print(f"DOCX load error: {e}")
            return ""

    def load_txt(self, file_path: str) -> str:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()

    def load(self, file_path: str) -> str:
        ext = os.path.splitext(file_path)[1].lower()
        if ext == ".pdf":
            return self.load_pdf(file_path)
        elif ext in [".docx", ".doc"]:
            return self.load_docx(file_path)
        elif ext == ".txt":
            return self.load_txt(file_path)
        return ""

    def load_directory(self, directory: str, extensions: List[str] = None) -> List[dict]:
        """Load all documents from a directory."""
        extensions = extensions or [".pdf", ".docx", ".txt", ".md"]
        documents = []
        for filename in os.listdir(directory):
            ext = os.path.splitext(filename)[1].lower()
            if ext in extensions:
                path = os.path.join(directory, filename)
                content = self.load(path)
                if content:
                    documents.append({
                        "filename": filename,
                        "path": path,
                        "content": content,
                        "metadata": {"source": filename, "type": ext},
                    })
        return documents

    def chunk_text(self, text: str, chunk_size: int = 512, overlap: int = 64) -> List[str]:
        """Split text into overlapping chunks."""
        words = text.split()
        if not words:
            return []
        chunks = []
        step = chunk_size - overlap
        for i in range(0, len(words), step):
            chunk = " ".join(words[i : i + chunk_size])
            if chunk.strip():
                chunks.append(chunk)
        return chunks


loader = DocumentLoader()
