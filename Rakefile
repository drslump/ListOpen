pwd = File.dirname(__FILE__)
dest = pwd + "/dist"

namespace :build do

  task :osx do
    tibuild = '/Library/Application\ Support/Titanium/sdk/osx/1.2.0.RC4/tibuild.py'

    # Remove previous build directory
    rm_f "#{dest}/osx"

    # Create the build directory and run the build process
    mkdir_p "#{dest}/osx"

    sh "#{tibuild} --noinstall -o osx -d '#{dest}/osx' '#{pwd}'"

    # Override the generated Info.plist with our custom version
    cp "#{pwd}/Info.plist", "#{dest}/osx/ListOpen.app/Contents/Info.plist"
  end

  task :linux do
    tibuild = '/home/drslump/.titanium/sdk/linux/1.2.0.RC4/tibuild.py'

    # Remove previous build directory
    rm_f "#{dest}/linux"

    # Create the build directory and run the build process
    mkdir_p "#{dest}/linux"

    sh "#{tibuild} --noinstall -o linux -d '#{dest}/linux' '#{pwd}'"
  end

  task :win32 do
    tibuild = '/cygdrive/c/Documents\ and\ Settings/Administrator/Application\ Data/Titanium/sdk/win32/1.2.0.RC4/tibuild.py'

    rm_f "#{dest}/win32"

    # Create the build directory and run the build process
    mkdir_p "#{dest}/win32"

    tibuild_w = %x( cygpath -w #{tibuild} )
    dest_w = %x( cygpath -w #{dest}/win32 )
    pwd_w = %x( cygpath -w #{pwd} )
    python_w = 'C:\Documents and Settings\Administrator\Application Data\Titanium\modules\win32\python\1.2.0.RC4\python'
    python = '/cygdrive/c/Documents\ and\ Settings/Administrator/Application\ Data/Titanium/modules/win32/python/1.2.0.RC4/python'

    # Before being able to run it we need to generate the packaging and run the installer
    #
    # Install .Net framework
    # Install WiX 32bit http://wix.codeplex.com/releases/view/60102
    #  
    # "c:\Documents and Settings\Administrator\Application Data\Titanium\modules\win32\python\1.2.0.RC4\python.exe" 
    # "c:\Documents and Settings\Administrator\Application Data\Titanium\sdk\win32\1.2.0.RC4\tibuild.py" 
    # -v -o win32 -t network 
    # -s "c:\Documents and Settings\Administrator\Application Data\Titanium" 
    # -a "c:\Documents and Settings\Administrator\Application Data\Titanium\sdk\win32\1.2.0.RC4" 
    # -d dist\win32 -p test.exe .

    #sh "cmd /C \"\"#{python_w}\" \"#{tibuild_w.strip! || tibuild_w}\" --noinstall -o win32 -d \"#{dest_w.strip! || dest_w}\" \"#{pwd_w.strip! || pwd_w}\"\""
    sh "#{python} \"#{tibuild_w.strip! || tibuild_w}\" -t network --noinstall -o win32 -d \"#{dest_w.strip! || dest_w}\" \"#{pwd_w.strip! || pwd_w}\""
  end


end

namespace :run do

  task :osx => "build:osx"  do
    exec "#{dest}/osx/ListOpen.app/Contents/MacOS/ListOpen", "--debug"
  end

  task :linux => "build:linux" do
    exec "#{dest}/linux/ListOpen/ListOpen", "--debug"
  end

  task :win32 => "build:win32" do
    exec "#{dest}/win32/ListOpen/ListOpen.exe", "--debug"
  end

end
