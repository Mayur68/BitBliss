from PIL import Image, ImageDraw
import os

# Create a directory to store the images
if not os.path.exists('shapes_dataset'):
    os.makedirs('shapes_dataset')

# Function to create and save a circle image
def create_circle_image(size, color, save_path):
    image = Image.new('RGB', size, color)
    draw = ImageDraw.Draw(image)
    draw.ellipse([10, 10, size[0]-10, size[1]-10], fill='white')
    image.save(save_path)

# Function to create and save a triangle image
def create_triangle_image(size, color, save_path):
    image = Image.new('RGB', size, color)
    draw = ImageDraw.Draw(image)
    draw.polygon([(10, size[1]-10), (size[0]-10, size[1]-10), (size[0]//2, 10)], fill='white')
    image.save(save_path)

# Generate circle images
circle_count = 100
for i in range(circle_count):
    create_circle_image((64, 64), 'blue', f'shapes_dataset/circle_{i}.png')

# Generate triangle images
triangle_count = 100
for i in range(triangle_count):
    create_triangle_image((64, 64), 'green', f'shapes_dataset/triangle_{i}.png')
