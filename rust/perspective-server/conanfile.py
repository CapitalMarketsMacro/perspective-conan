from conan import ConanFile
from conan.tools.cmake import cmake_layout


class PerspectiveServerConan(ConanFile):
    name = "perspective-server"
    version = "4.3.0"
    settings = "os", "compiler", "build_type", "arch"
    generators = "CMakeToolchain", "CMakeDeps", "VirtualBuildEnv"

    def requirements(self):
        # Arrow pinned to 18.1.0 to match perspective 4.5.0's engine source
        # (upstream cmake/arrow.txt.in pins apache-arrow-18.1.0). Using a newer
        # Arrow (e.g. 22) breaks the 4.5 C++ against API changes
        # (arrow::io::BufferReader ctor, util::string_view::ToString, ...).
        self.requires("arrow/18.1.0")
        self.requires("protobuf/6.33.5")
        # re2 2021-11-01 matches perspective 4.5's source (cmake/re2.txt.in):
        # newer re2 aliases re2::StringPiece to std::string_view (no .ToString()),
        # breaking computed_function.cpp. This re2 predates re2's abseil dep, so
        # it doesn't conflict with the newer abseil/protobuf above.
        self.requires("re2/20211101")
        self.requires("abseil/20260107.1", force=True)
        self.requires("rapidjson/cci.20230929")
        self.requires("boost/1.86.0")
        self.requires("date/3.0.4")
        self.requires("tsl-hopscotch-map/2.3.1")
        self.requires("tsl-ordered-map/1.1.0")
        self.requires("exprtk/0.0.2")

    def configure(self):
        # Disable Arrow features that pull deps from restricted download URLs
        # (thrift -> archive.apache.org). Enable the codecs + CSV the perspective
        # engine actually uses (arrow/csv/reader.h, writer.h; IPC compression).
        self.options["arrow"].with_thrift = False
        self.options["arrow"].parquet = False
        self.options["arrow"].with_csv = True
        self.options["arrow"].with_zstd = True
        self.options["arrow"].with_lz4 = True

    def layout(self):
        cmake_layout(self)
