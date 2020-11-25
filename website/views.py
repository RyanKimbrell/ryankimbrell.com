from django.shortcuts import render

def index(request):

    test = "this is a test"

    return render(request, "website/index.html", {
        "test": test
    })
