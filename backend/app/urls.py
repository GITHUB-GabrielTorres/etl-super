from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/pbx/', include('pbx.urls')),
    path('api/v1/empresa/', include('empresa.urls'))
]
