from selenium import webdriver
from selenium.webdriver.common.keys import Keys
import os
import time
import sys
from threading import Thread

def try_word(word, known):
    try:
        if len(word) != len(known):
            raise ValueError("Word and known aren't the same length!")
        x = 0
        for char in known:
            if word[x] == char or char == "*":
                if x == len(word) - 1:
                    elem = driver.find_element_by_id("inputChat")
                    elem.clear()
                    elem.send_keys(word) 
                    elem.send_keys(Keys.ENTER)
                    time.sleep(1)
                else: 
                    x += 1
                    continue
            else:
                break
    except Exception as e:
        print(e)

def get_words():
    method = input("1: Read words from file | 2: Enter words comma seperated | 3: Use words.txt >")
    if method == "1":
        with open(input("Filename >"), "r") as file:
	        words = file.readlines()
        final_words = []
        for word in words:
            word = word.replace("\n", "")
            final_words.append(word)
        return final_words
    elif method == "2":	
        words = input("Enter the words seperatet by \",\" (no space):")
        words = words.split(",")
        return words
    elif method == "3":
        with open("words.txt", "r") as file:
	        words = file.readlines()
        final_words = []
        for word in words:
            word = word.replace("\n", "")
            final_words.append(word)
        return final_words
    else: 
        print("Invalid input!")
        return get_words()

def sort_words(words):
    longest = 0
    for word in words:
        if len(word) > longest:
            longest = len(word)
    all_words = {}
    for leng in range(longest):
        current_words = []
        for word in words:
            if len(word) == leng:
                current_words.append(word)
        all_words[leng] = current_words
    return all_words

def get_current_word():
    elem = driver.find_element_by_id("currentWord")
    return elem.text

def get_player():
    players = driver.find_elements_by_class_name("player")
    for player in players:
        info = player.find_elements_by_class_name("info")
        nameElem = info[0].find_elements_by_class_name("name")
        name = nameElem[0].text
        if "(You)" in name:
            return player

def clear_screen():
    # for windows
    if os.name == 'nt':
        _ = os.system('cls')
    # for mac and linux(here, os.name is 'posix')
    else:
        _ = os.system('clear')

def handleInput():
    global cmd
    global should_print
    global auto
    global clear

    while True:
        time.sleep(1)
        inp = input("")
        if inp == "len":
            should_print = False
            leng = input("Enter the new length >")
            should_print = True
            cmd = "len " + leng
        elif inp == "quit":
            cmd = "quit"
            sys.exit()
        elif inp == "known":
            should_print = False
            known = input("Enter what you know >")
            should_print = True
            cmd = "known " + known
        elif inp == "done":
            cmd = "done"
        elif inp == "auto":
            auto = not auto
        elif inp == "clear":
            clear = not clear
        else:
            should_print = False
            if auto:
                print("Unknown command\nUse one of these: len quit known done auto clear")
            else:
                print("Unknown command\nUse one of these: quit auto clear")
            time.sleep(1)
            should_print = True

def run():
    global cmd
    global should_print
    global auto
    global done
    global clear
    player = None
    known = ""
    leng = 0

    while True:
        if leng == 0 and not auto:
            leng = input("Enter the length >")
            known = "*" * int(leng)
        elif leng == 0:
            known = get_current_word().replace("_", "*")
            leng = len(known)

        if player == None:
            player = get_player()

        current = 0
        list_len = len(words[int(leng)])

        for word in words[int(leng)]:
            current += 1

            if auto:
                if player.get_attribute("class") == "player guessedWord" and not done:
                    cmd = "done"
                temp = known
                known = get_current_word().replace("_", "*")
                temp2 = leng
                leng = len(known)
                if len(known.replace("*", "")) < len(temp.replace("*", "")) or temp2 != leng:
                    print("New word detected, restarting with length " + str(leng))
                    done = False
                    break

            if cmd != "":
                if "len " in cmd:
                    leng = int(cmd.replace("len ", ""))
                    known = "*" * int(leng)
                    print("Length set successfully")
                    cmd = ""
                    break

                elif cmd == "quit":
                    sys.exit()

                elif "known" in cmd:
                    known = cmd.replace("known ", "")
                    print("Set known to: " + known)
                    cmd = ""

                elif cmd == "done":
                    if not auto:
                        leng = 0
                    else:
                        done = True
                        print("Word found: '" + lastWord + "', waiting for it to change...")
                    cmd = ""
                    break

            if should_print and not done:
                if clear:
                    clear_screen()
                percent = int(current * 100 / list_len)
                percent_string = "[ " + " " * (3 - len(str(percent))) + "" + str(percent) + "% ]"
                progress_bar_string = "[" + "#" * int(percent / 10) + " " * int(10 - int(percent / 10)) + "]"
                count_string = "[ " + " " * (len(str(list_len)) - len(str(current))) + "" + str(current) + " / " + str(list_len) + " ]: " 
                print(percent_string + progress_bar_string + count_string + word)

            if not done:
                lastWord = word
                try_word(word, known)

        if not auto:
            leng = 0

cmd = ""
should_print = True
auto = input("Start with auto mode? True | False >")
done = False
clear = False
while (not auto == "True") and (not auto == "False"):
    auto = input("Invalid input. True | False >")
words = sort_words(get_words())
options = webdriver.ChromeOptions()
options.add_experimental_option('excludeSwitches', ['enable-logging'])
options.add_argument("--disable-extensions")
driver = webdriver.Chrome(".\chromedriver.exe", options=options)
driver.get("https://skribbl.io")

input_thread = Thread(target=handleInput)
run_thread = Thread(target=run)

input_thread.start()
run_thread.start()