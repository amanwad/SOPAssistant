import docx

doc = docx.Document("/Users/amanwadhwa/Downloads/Italian Unification Lecture Notes.docx")
text = ""

for paragraph in doc.paragraphs:
    text += paragraph.text + "\n"

print(text)