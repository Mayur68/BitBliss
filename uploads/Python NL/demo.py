from PIL import Image
import numpy as np


class Layer_Dense:
    def __init__(self, n_inputs, neurons):
        self.neurons = neurons
        self.weights = np.random.randn(
            n_inputs, neurons) * np.sqrt(2 / n_inputs)
        self.biases = np.zeros((1, neurons))
        self.inputs = None
        self.dweights = None
        self.dbiases = None

    def forward(self, inputs):
        self.inputs = inputs
        self.output = np.dot(inputs, self.weights) + self.biases

    def backward(self, dvalues):
        # Reshape inputs and dvalues to be compatible for matrix multiplication
        dvalues_reshaped = dvalues.reshape(-1, self.neurons)

        # Ensure self.inputs is reshaped properly (it should be 2D)
        inputs_reshaped = self.inputs.reshape(-1, self.weights.shape[0])

        # Calculate gradients
        self.dinputs = np.dot(dvalues_reshaped, self.weights.T)
        self.dweights = np.dot(inputs_reshaped.T, dvalues_reshaped)
        self.dbiases = np.sum(dvalues_reshaped, axis=0, keepdims=True)

    def update_params(self, learning_rate):
        self.weights -= learning_rate * self.dweights
        self.biases -= learning_rate * self.dbiases


# Define the Rectified Linear Unit (ReLU) activation function


class Activation_ReLU:
    def forward(self, inputs):
        self.inputs = inputs
        self.output = np.maximum(0, inputs)

    def backward(self, dvalues):
        # Gradient on the ReLU function
        dvalues[self.inputs <= 0] = 0
        self.dinputs = dvalues.copy()

# Define the Softmax activation function


class Activation_Softmax:
    def forward(self, inputs):
        exp_values = np.exp(inputs - np.max(inputs, axis=1, keepdims=True))
        probabilities = exp_values / np.sum(exp_values, axis=1, keepdims=True)
        self.output = probabilities

    def backward(self, dvalues):
        # Gradients for softmax function
        self.dinputs = np.empty_like(dvalues)

        for index, (single_output, single_dvalues) in enumerate(zip(self.output, dvalues)):
            single_output = single_output.reshape(-1, 1)
            jacobian_matrix = np.diagflat(
                single_output) - np.dot(single_output, single_output.T)
            self.dinputs[index] = np.dot(jacobian_matrix, single_dvalues)

# Define a general Loss class and a specific Categorical Crossentropy loss function


class Loss:
    def calculate(self, output, labels):
        sample_losses = self.forward(output, labels)
        data_loss = np.mean(sample_losses)
        return data_loss


class MeanSquaredError(Loss):
    def forward(self, predictions, targets):
        return np.mean((predictions - targets) ** 2)


class Loss_CategoricalCrossentropy(Loss):
    def forward(self, y_pred, y_true):
        # Compute the negative log likelihoods for the predicted and true labels
        samples = len(y_pred)
        y_pred_clipped = np.clip(y_pred, 1e-7, 1 - 1e-7)

        if len(y_true.shape) == 1:
            correct_confidences = y_pred_clipped[range(samples), y_true]
        elif len(y_true.shape) == 2:
            correct_confidences = np.sum(y_pred_clipped * y_true, axis=1)

        negative_log_likelihoods = -np.log(correct_confidences)
        return negative_log_likelihoods

    def backward(self, dvalues, y_true):
        # Compute gradients for the Categorical Crossentropy loss
        samples = len(dvalues)
        self.dinputs = dvalues.copy()
        self.dinputs[range(samples), y_true] -= 1
        self.dinputs /= samples


shape_classes = ["circle", "triangle", "other"]
image = Image.open('./circle_1.png')
resized_image = image.resize((28, 28))
flattened_image = np.array(resized_image).flatten()
labels = np.array([1, 0, 0])


dense1 = Layer_Dense(784, 128)
activation1 = Activation_ReLU()

dense2 = Layer_Dense(128, 3)
activation2 = Activation_Softmax()

dense1.forward(flattened_image)
activation1.forward(dense1.output)

dense2.forward(activation1.output)
activation2.forward(dense2.output)

loss_function = Loss_CategoricalCrossentropy()
loss = loss_function.calculate(activation2.output, labels)

loss_function.backward(activation2.output, labels)
activation2.backward(loss_function.dinputs)
dense2.backward(activation2.dinputs)
activation1.backward(dense2.dinputs)
dense1.backward(activation1.dinputs)

dense1.update_params(0.01)
dense2.update_params(0.01)

print("Loss:", loss)

predicted_shape_index = np.argmax(activation2.output, axis=1)[0]
predicted_shape_name = shape_classes[predicted_shape_index]

print("Predicted Shape:", predicted_shape_name)
