import transformers
import torch

# Load pre-trained sentiment analysis model
tokenizer = transformers.AutoTokenizer.from_pretrained("distilbert-base-uncased")
model = transformers.AutoModelForSequenceClassification.from_pretrained("distilbert-base-uncased-finetuned-sst-2-english")

# Set up device (CPU or GPU)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Function to analyze sentiment
def analyze_sentiment(text):
    # Tokenize input text
    encoded_input = tokenizer.encode_plus(
        text,
        add_special_tokens=True,
        max_length=512,
        padding="longest",
        truncation=True,
        return_tensors="pt"
    )

    # Move input to the appropriate device
    encoded_input = encoded_input.to(device)

    # Perform inference
    with torch.no_grad():
        model_output = model(**encoded_input)

    # Get predicted sentiment label
    predicted_label = torch.argmax(model_output.logits).item()

    # Map label to sentiment
    sentiments = ["Negative", "Positive"]
    sentiment = sentiments[predicted_label]

    return sentiment

# Main program loop
print("Welcome to the Sentiment Analyzer!")

while True:
    # Get user input
    user_input = input("Enter a sentence (or 'q' to quit): ")

    if user_input.lower() == "q":
        break

    # Analyze sentiment
    sentiment = analyze_sentiment(user_input)

    # Print sentiment
    print("Sentiment:", sentiment)

print("Thank you for using the Sentiment Analyzer!")
