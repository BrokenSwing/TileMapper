from pathlib import Path
import json


class ProjectProperties:
    """
    Hold properties for a project such as name
    """

    def __init__(self, name: str):
        self.name = name

    def as_json(self) -> str:
        """
        Serialize properties to Json
        :return: a json as str
        """
        return json.dumps({
            "name": self.name
        })

    @staticmethod
    def from_file(path_str: str):
        """
        Load properties from a file
        :param path_str: the file path
        :return: the properties read from the file
        """
        path = Path(path_str)
        if not path.is_file():
            return None

        with open(str(path), 'r') as file:
            return ProjectProperties.from_str(file.read())

    @staticmethod
    def from_str(content: str):
        """
        Load properties from the given str. The str must be a well formed json
        :param content: the str to read the properties from
        :return: the properties read from the str
        """
        props = json.loads(content)

        if 'name' in props:
            return ProjectProperties(props['name'])
        return None


class Project:

    def __init__(self, path, properties: ProjectProperties):
        self.path = path
        self.properties = properties

    @property
    def name(self) -> str:
        return self.properties.name

    @name.setter
    def name(self, new_value: str):
        self.properties.name = new_value
