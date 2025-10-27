from collections import OrderedDict
# Create your views here.
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

class CustomPaginationClass(PageNumberPagination):
    page_size = 2  # this is equivalent to your 'page_item_count'
    page_size_query_param = 'page_item_count' # this sets the param name for the page size
    max_page_size = 5

    def get_paginated_response(self, data):
        return Response(OrderedDict([
        ('page_count', self.get_page_size(self.request)), # total # on current page
        ('page_number', int(self.request.query_params.get(self.page_query_param, 1))),
        ('result_count', self.page.paginator.count),     # total # of objects that will be paginated
        ('next', self.get_next_link()),
        ('previous', self.get_previous_link()),
        ('results', data)
        ]))

    def get_page_size(self, request):

        if 'count_page' in request.GET:
            return int(request.GET['count_page'])
        else:
            return 10
        
