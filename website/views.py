from django.shortcuts import render


def index(request):
    return render(request, "website/index.html")

def bio(request):
    return render(request, "website/bio.html")

def samplepacks(request):
    return render(request, "website/samplepacks.html")

def artwork(request):
    return render(request, "website/artwork.html")

def plugins(request):
    return render(request, "website/plugins.html")

def resume(request):
    return render(request, "website/resume.html")
    
def portfolio(request):
    return render(request, "website/portfolio.html")

def contact(request):
    return render(request, "website/contact.html")
    
def music(request):
    return render(request, "website/music.html")

def galaxyhome(request):
    return render(request, "website/galaxyhome.html")