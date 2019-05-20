# This class stock the TileSet data
class TileSet:
    def __init__(self, image, width_tile, height_tile):
        self.image = image
        self.width_tile = width_tile
        self.height_tile = height_tile
        self.width, self.height = image.size

    def get_image(self):
        return self.image

    def get_tile_width(self):
        return self.width_tile

    def get_tile_height(self):
        return self.height_tile

    def get_image_size(self):
        return self.width, self.height
