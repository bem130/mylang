// // 2022.4 haruki1234
#include<stdio.h>
#include<stdlib.h>


int *lcode;
int fsize;


void run() {
    int clen = fsize/4;

    // 即値:0, int: 1

    int int_var[256];
    int sta[256];
    int stp = 0;
    int label[256];

    int_var[0] = 0;

    int p;
    p = 0;
    while (p<clen) {
        if (lcode[p+0]==0) { // label
            label[lcode[p+1]] = p;
        }
        p+=5;
    }
    p = 0;
    while (p<clen) {
        switch (lcode[p+0])
        {
            case 1: // mov
                switch (lcode[p+1])
                {
                    case 0:
                        int_var[lcode[p+3]] = lcode[p+4];
                    break;
                    case 1:
                        int_var[lcode[p+3]] = int_var[lcode[p+4]];
                    break;
                }
            break;
            case 2: // add
                switch (lcode[p+1])
                {
                    case 0:
                        int_var[lcode[p+3]] += lcode[p+4];
                    break;
                    case 1:
                        int_var[lcode[p+3]] += int_var[lcode[p+4]];
                    break;
                }
            break;
            case 3: // sub
                switch (lcode[p+1])
                {
                    case 0:
                        int_var[lcode[p+3]] -= lcode[p+4];
                    break;
                    case 1:
                        int_var[lcode[p+3]] -= int_var[lcode[p+4]];
                    break;
                }
            break;
            case 4: // mul
                switch (lcode[p+1])
                {
                    case 0:
                        int_var[lcode[p+3]] *= lcode[p+4];
                    break;
                    case 1:
                        int_var[lcode[p+3]] *= int_var[lcode[p+4]];
                    break;
                }
            break;
            case 5: // div
                switch (lcode[p+1])
                {
                    case 0:
                        int_var[lcode[p+3]] = int_var[lcode[p+3]]/lcode[p+4];
                    break;
                    case 1:
                        int_var[lcode[p+3]] = int_var[lcode[p+3]]/int_var[lcode[p+4]];
                    break;
                }
            break;
            case 6: // push
                switch (lcode[p+1])
                {
                    case 0:
                        sta[stp] = lcode[p+4];
                    break;
                    case 1:
                        sta[stp] = int_var[lcode[p+4]];
                    break;
                }
                stp++;
            break;
            case 7: // pop
                stp--;
                switch (lcode[p+1])
                {
                    case 1:
                        int_var[lcode[p+3]] = sta[stp];
                    break;
                }
            break;
        }
        //printf(": %d\n",int_var[0]);
        p+=5;
    }
    printf("result: %d",int_var[0]);
    
    return;
}

int main() {

    
    FILE *fp;
    if ((fp = fopen("a:/mylang/code.bin", "rb+")) == NULL) {
        printf("Can't open a file.");
        return 1;
    }
    FILE *fp2;
    if ((fp2 = fopen("a:/mylang/code2.bin", "wb+")) == NULL) {
        printf("Can't open a file.");
        return 1;
    }

    fpos_t fs;
    fseek(fp, 0, SEEK_END); // ファイルポインタを末尾へ移動
    fgetpos(fp, &fs); // ファイルポインタの位置を取得
    fsize = fs;
    fseek(fp, 0, SEEK_SET); // ファイルポインタを末尾へ移動

    lcode = (int*)malloc(fsize);

    printf("file: %d byte\n",fsize);
    int head[1];
    char f = 1;
    while (f) {
        fread(head,4,1,fp);
        if (head[0]==0) {
            f = 0;
        }
        fsize-=4;
    }
    fread(lcode,4,fsize/4,fp);
    
	printf("%d \n",sizeof(int));

	for (int i=0; i<fsize/4; i++)
		printf("%d ",lcode[i]);
	printf("\n");

    fwrite(lcode,4,fsize/4,fp2);

    fclose(fp);
    fclose(fp2);


    run();
    return 0;
}