from pypresence import Presence
import time
from tkinter import *
import json
import validators

client_id = "840232479491227668"
RPC = Presence(client_id)
RPC.connect()

RPC.update(state="Initializing rich presence...")

root = Tk()
root.title("Custom discord rich presence") 
root.geometry("450x550")

err = StringVar(root)
c_start = time.mktime(time.localtime())
useImages = BooleanVar(root)
useStartTime = BooleanVar(root)
useEndTime = BooleanVar(root)
useParty = BooleanVar(root)

def setTime():
    global c_start
    c_start = time.mktime(time.localtime())
    updatePresence()

def save():
    data = {
        "state": c_state.get(),
        "details": c_details.get(),
        "useImages": useImages.get(),
        "small_image": c_small_image.get(),
        "large_image": c_large_image.get(),
        "small_text": c_small_text.get(),
        "large_text": c_large_text.get(),
        "useStartTime": useStartTime.get(),
        "start": c_start,
        "useEndTime": useEndTime.get(),
        "end": c_end.get(),
        "SliderButtons": SliderButtons.get(),
        "button1_text": c_button1_text.get(),
        "button1_url": c_button1_url.get(),
        "button2_text": c_button2_text.get(),
        "button2_url": c_button2_url.get(),
        "useParty": useParty.get(),
        "psize_cur": c_psize_cur.get(),
        "psize_max": c_psize_max.get()
    }

    saveData = json.dumps(data)

    with open(c_save_file_name.get() + ".json", "w") as outfile:
        outfile.write(saveData)

def load():
    global c_start
    with open(c_save_file_name.get() + ".json", "r") as infile:
        data = json.load(infile)
        c_state.insert(0, data['state'])
        c_details.insert(0, data['details'])
        useImages.set(data['useImages'])
        c_small_image.insert(0, data['small_image'])
        c_large_image.insert(0, data['large_image'])
        c_small_text.insert(0, data['small_text'])
        c_large_text.insert(0, data['large_text'])
        useStartTime.set(data['useStartTime'])
        c_start = data['start']
        useEndTime.set(data['useEndTime'])
        c_end.insert(0, data['end'])
        SliderButtons.set(data['SliderButtons'])
        c_button1_text.insert(0, data['button1_text'])
        c_button1_url.insert(0, data['button1_url'])
        c_button2_text.insert(0, data['button2_text'])
        c_button2_url.insert(0, data['button2_url'])
        useParty.set(data['useParty'])
        c_psize_cur.insert(0, data['psize_cur'])
        c_psize_max.insert(0, data['psize_max'])
    updatePresence()

def hide(entry, _row, _column, hidden):
    if hidden:
        entry.grid_forget()
    else:
        entry.grid(row=_row, column=_column)

def updatePresence():
    if len(c_state.get()) < 2:
        err.set("Invalid string: state")
        return

    if len(c_details.get()) < 2:
        err.set("Invalid string: details")
        return

    if useEndTime.get():
        try: 
            time = int(c_end.get())
            if time < 1:
                err.set("Invalid int: end time")
                return
        except ValueError:
            err.set("Invalid int: end time")
            return
    
    if SliderButtons.get() > 0:
        if len(c_button1_text.get()) < 1:
            err.set("Invalid string: Button 1")
            return
        if not validators.url(c_button1_url.get()):
            err.set("Invalid url: Button 1")
            return
        if SliderButtons.get() > 1 and len(c_button2_text.get()) < 1:
            err.set("Invalid string: Button 2")
            return
        if not validators.url(c_button2_url.get()):
            err.set("Invalid url: Button 2")
            return
    
    if useParty.get():
        try: 
            size = int(c_psize_cur.get())
            if size < 1:
                err.set("Invalid int: current party size")
                return
        except ValueError:
            err.set("Invalid int: current party size")
            return
        try: 
            size = int(c_psize_max.get())
            if size < 1:
                err.set("Invalid int: max party size")
                return
        except ValueError:
            err.set("Invalid int: max party size")
            return

    code = "RPC.update(state=\"" + c_state.get() + "\", details=\"" + c_details.get() + "\""

    if useImages.get():
        code += ", small_image=\"" + c_small_image.get() + "\", large_image=\"" + c_large_image.get() + "\", small_text=\"" + c_small_text.get() + "\", large_text=\"" + c_large_text.get() + "\""
    if SliderButtons.get() > 0:
        code += ", buttons=[{\"label\":\"" + c_button1_text.get() + "\", \"url\":\"" + c_button1_url.get() + "\""
        if SliderButtons.get() > 1:
            code += "}, {\"label\":\"" + c_button2_text.get() + "\", \"url\":\"" + c_button2_url.get() + "\""
        code += "}]" 
    if useStartTime.get():
        code += ", start=" + str(c_start)
    elif useEndTime.get(): 
        code += ", end=" + str(c_end.get())
    if useParty.get():
        code += ", party_size=[" + c_psize_cur.get() + "," + c_psize_max.get() + "]"

    code += ")"

    exec(code)

    err.set("")

def update():
    if not useImages.get():
        c_small_image_label.grid_forget()
        c_large_image_label.grid_forget()
        c_small_text_label.grid_forget()
        c_large_text_label.grid_forget()
        c_small_image.grid_forget()
        c_large_image.grid_forget()
        c_small_text.grid_forget()
        c_large_text.grid_forget()
    else:
        c_small_image_label.grid(row=4, column=1)
        c_large_image_label.grid(row=5, column=1)
        c_small_text_label.grid(row=6, column=1)
        c_large_text_label.grid(row=7, column=1)
        c_small_image.grid(row=4, column=2)
        c_large_image.grid(row=5, column=2)
        c_small_text.grid(row=6, column=2)
        c_large_text.grid(row=7, column=2)

    if not useEndTime.get():
        c_end_label.grid_forget()
        c_end.grid_forget()
    else:
        c_end_label.grid(row=10, column=1)
        c_end.grid(row=10, column=2)

    if SliderButtons.get() > 0:
        c_button1_text_label.grid(row=12, column=1)
        c_button1_url_label.grid(row=13, column=1)
        c_button1_text.grid(row=12, column=2)
        c_button1_url.grid(row=13, column=2)
        
        if SliderButtons.get() > 1:
            c_button2_text_label.grid(row=14, column=1)
            c_button2_url_label.grid(row=15, column=1)
            c_button2_text.grid(row=14, column=2)
            c_button2_url.grid(row=15, column=2) 
        else: 
            c_button2_text_label.grid_forget()
            c_button2_url_label.grid_forget()
            c_button2_text.grid_forget()
            c_button2_url.grid_forget()

    else:
        c_button1_text_label.grid_forget()
        c_button1_url_label.grid_forget()
        c_button1_text.grid_forget()
        c_button1_url.grid_forget()
        c_button2_text_label.grid_forget()
        c_button2_url_label.grid_forget()
        c_button2_text.grid_forget()
        c_button2_url.grid_forget()

    if not useParty.get():
        c_psize_cur_label.grid_forget()
        c_psize_max_label.grid_forget()
        c_psize_cur.grid_forget()
        c_psize_max.grid_forget()
    else:
        c_psize_cur_label.grid(row=17, column=1)
        c_psize_max_label.grid(row=18, column=1)
        c_psize_cur.grid(row=17, column=2)
        c_psize_max.grid(row=18, column=2)

    root.after(100, update)

c_state_label = Label(root, text="State")
c_state_label.grid(row=1, column=1)
c_state = Entry(root, width=50)
c_state.grid(row=1, column=2)

c_details_label = Label(root, text="Details")
c_details_label.grid(row=2, column=1)
c_details = Entry(root, width=50)
c_details.grid(row=2, column=2)

checkBoxUseImagesLabel = Label(root, text="Enable images")
checkBoxUseImagesLabel.grid(row=3, column=1)
checkBoxUseImages = Checkbutton(root, variable=useImages)
checkBoxUseImages.grid(row=3, column=2)

c_small_image_label = Label(root, text="Small image")
c_small_image_label.grid(row=4, column=1)
c_small_image = Entry(root, width=50)
c_small_image.grid(row=4, column=2)

c_large_image_label = Label(root, text="Large image")
c_large_image_label.grid(row=5, column=1)
c_large_image = Entry(root, width=50)
c_large_image.grid(row=5, column=2)

c_small_text_label = Label(root, text="Small text")
c_small_text_label.grid(row=6, column=1)
c_small_text = Entry(root, width=50)
c_small_text.grid(row=6, column=2)

c_large_text_label = Label(root, text="Large text")
c_large_text_label.grid(row=7, column=1)
c_large_text = Entry(root, width=50)
c_large_text.grid(row=7, column=2)

checkBoxUseTimeLabel = Label(root, text="Enable start time")
checkBoxUseTimeLabel.grid(row=8, column=1)
checkBoxUseTime = Checkbutton(root, variable=useStartTime)
checkBoxUseTime.grid(row=8, column=2)

checkBoxUseTimeLabel = Label(root, text="Enable end time")
checkBoxUseTimeLabel.grid(row=9, column=1)
checkBoxUseTime = Checkbutton(root, variable=useEndTime)
checkBoxUseTime.grid(row=9, column=2)

c_end_label = Label(root, text="End")
c_end_label.grid(row=10, column=1)
c_end = Entry(root, width=50)
c_end.grid(row=10, column=2)

SliderButtonsLabel = Label(root, text="Button count")
SliderButtonsLabel.grid(row=11, column=1)
SliderButtons = Scale(root, from_=0, to=2, orient=HORIZONTAL)
SliderButtons.grid(row=11, column=2)

c_button1_text_label = Label(root, text="Button 1 text")
c_button1_text_label.grid(row=12, column=1)
c_button1_text = Entry(root, width=50)
c_button1_text.grid(row=12, column=2)

c_button1_url_label = Label(root, text="Button 1 url")
c_button1_url_label.grid(row=13, column=1)
c_button1_url = Entry(root, width=50)
c_button1_url.grid(row=13, column=2)

c_button2_text_label = Label(root, text="Button 2 text")
c_button2_text_label.grid(row=14, column=1)
c_button2_text = Entry(root, width=50)
c_button2_text.grid(row=14, column=2)

c_button2_url_label = Label(root, text="Button 2 url")
c_button2_url_label.grid(row=15, column=1)
c_button2_url = Entry(root, width=50)
c_button2_url.grid(row=15, column=2)

checkBoxUsePartyLabel = Label(root, text="Enable party")
checkBoxUsePartyLabel.grid(row=16, column=1)
checkBoxUseParty = Checkbutton(root, variable=useParty)
checkBoxUseParty.grid(row=16, column=2)

c_psize_cur_label = Label(root, text="Current party size")
c_psize_cur_label.grid(row=17, column=1)
c_psize_cur = Entry(root, width=50)
c_psize_cur.grid(row=17, column=2)

c_psize_max_label = Label(root, text="Max party size")
c_psize_max_label.grid(row=18, column=1)
c_psize_max = Entry(root, width=50)
c_psize_max.grid(row=18, column=2)

c_save_file_name_label = Label(root, text="Save file name")
c_save_file_name_label.grid(row=19, column=1)
c_save_file_name = Entry(root, width=50)
c_save_file_name.grid(row=19, column=2)

c_save_file_name.insert(0, "save")

buttonSave = Button(root, text="Save current presence", command=save)
buttonSave.grid(row=20, column=1)
buttonLoad = Button(root, text="Load presence", command=load)
buttonLoad.grid(row=20, column=2)

buttonDone = Button(root, text="Update presence", command=updatePresence)
buttonDone.grid(row=21, column=1)
buttonResetTime = Button(root, text="Reset start time", command=setTime)
buttonResetTime.grid(row=21, column=2)

errorLabel = Label(root, textvariable=err)
errorLabel.grid(row=22, column=1)

update()
root.mainloop()