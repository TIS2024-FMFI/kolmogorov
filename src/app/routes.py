from flask import render_template # type: ignore

def home():
    return render_template('welcome.html')