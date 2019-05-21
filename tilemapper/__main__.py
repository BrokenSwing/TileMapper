import pyglet
import logging
import logging.config
from pyglet.gl import *
import yaml
import sys
from tilemapper.project import ProjectProperties, Project
import pathlib


def main():
    # Load logger config and create logger
    logging.config.dictConfig(yaml.full_load(open('log_config.yaml')))
    logger = logging.getLogger("TileMapper")

    # Did we opened a file with this script ?
    if len(sys.argv) > 1:
        project_properties = ProjectProperties.from_file(sys.argv[1])
        if project_properties is not None:
            project_path = str(pathlib.Path(sys.argv[1]).parent)
            project = Project(project_path, project_properties)
            logger.info("Opened project '%s' located at : %s", project.name, project.path)
        else:
            logger.warning("Couldn't open project from file : %s", sys.argv[1])

    # Initializing window
    window = pyglet.window.Window(visible=False, caption="Tile Mapper")
    logger.info("OpenGL Version : %s", gl_info.get_version())
    logger.info("Renderer : %s", gl_info.get_renderer())
    logger.info("Vendor : %s", gl_info.get_vendor())

    # Subscribe to event here

    window.set_visible()
    pyglet.app.run()


if __name__ == '__main__':
    main()
