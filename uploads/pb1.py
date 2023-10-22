from tkinter import *
def create_button(label, row, column):

    if label == '=':
        button = Button(app, text=label, fg="black", bg="skyblue", command=equalpress, height=1, width=7)
        button.grid(columnspan=4, row=row, column=column, ipadx=122)
    elif label == 'C':
        button = Button(app, text='Clear', fg="black", bg="white", command=clear, height=1, width=7)
        button.grid(row=row, column=column)
    else:
        button = Button(app, text=label, fg="black", bg="white", command=lambda: press(label), height=1, width=7)
        button.grid(row=row, column=column, pady=10)

expression = "" 
def press(num):
    global expression
    expression = expression + str(num)
    equation.set(expression)
def equalpress():


    try:
        global expression
        total = str(eval(expression))
        equation.set(total)
        expression = "" 
    except:
        equation.set("error")
        expression = "" 
def clear():
    global expression
    expression = "" 
    equation.set("")

app = Tk()
app.configure(background="gray")
app.title("Simple Calculator")
app.geometry("300x250")
equation = StringVar()
expression_field = Entry(app, textvariable=equation)
expression_field.grid(columnspan=4, ipadx=90, ipady=10)
button_labels = ['1', '2', '3', '+', '4', '5', '6', '-', '7', '8', '9', '*', '0', '.', '/', 'C','=']
row = 2
column = 0
for label in button_labels:
    create_button(label, row, column)
    column += 1
    if column > 3:
        column = 0
        row += 1
app.mainloop()
