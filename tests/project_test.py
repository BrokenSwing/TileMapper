import unittest
from tilemapper.project import Project, ProjectProperties


class TestProjectProperties(unittest.TestCase):

    def test_str_parse(self):
        content = """
            {
                "name": "Jhon"
            }
        """
        properties = ProjectProperties.from_str(content)
        self.assertEqual(properties.name, "Jhon")


class TestProject(unittest.TestCase):

    def test_name_property(self):
        properties = ProjectProperties("Henry")
        project = Project("path/to/project", properties)

        self.assertEqual(project.name, "Henry")
        self.assertEqual(project.path, "path/to/project")

        project.name = "Jhon"
        self.assertEqual(project.name, "Jhon")
        self.assertEqual(project.properties.name, "Jhon")
