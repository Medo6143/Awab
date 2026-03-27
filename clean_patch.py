import sys

def clean_patch(input_file, output_file):
    with open(input_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    keep_blocks = []
    current_block = []
    include_current = False

    for line in lines:
        if line.startswith('diff --git'):
            if current_block and include_current:
                keep_blocks.append(current_block)
            current_block = [line]
            include_current = False
            
            # Check if we should include this file
            file_path = line.split(' ')[-1].strip()
            if 'node_modules/react-native-floating-bubble/android/' in file_path:
                # Exclude build artifacts and IDE files
                if any(x in file_path for x in ['.project', '.settings/', '/build/', '/tmp/', '/outputs/', '.bin', '.class', '.dex', '.jar', '.flat']):
                    include_current = False
                else:
                    include_current = True
            else:
                # If it's not in node_modules/react-native-floating-bubble/android/ but somehow in the patch, 
                # we should decide. But standard patches are usually for a single package.
                include_current = True
        else:
            current_block.append(line)

    # Add the last block
    if current_block and include_current:
        keep_blocks.append(current_block)

    with open(output_file, 'w', encoding='utf-8', newline='\n') as f:
        for block in keep_blocks:
            f.writelines(block)

if __name__ == "__main__":
    clean_patch(sys.argv[1], sys.argv[2])
