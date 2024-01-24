#include <ctype.h>
#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include <windows.h>
#include <stdlib.h>
#include <conio.h>

#define _WIN32_ENVIRONMENT_

const int MAX_O=16;                         /* maximum allowed model order  */

#define _USE_PREFETCHING                    /* for puzzling mainly          */

#define _FASTCALL __fastcall
#define _STDCALL  __stdcall
#define _PACK_ATTR

#ifdef  __cplusplus
extern "C" {
#endif

BOOL  _STDCALL StartSubAllocator(UINT SubAllocatorSize);
void  _STDCALL StopSubAllocator();          /* it can be called once        */
DWORD _STDCALL GetUsedMemory();             /* for information only         */

enum MR_METHOD { MRM_RESTART, MRM_CUT_OFF, MRM_FREEZE };

int _STDCALL EncodeFile(byte inM[],byte outM[],int inLen, int MaxOrder);
int _STDCALL DecodeFile(byte inM[],byte outM[],int inLen, int MaxOutLen, int MaxOrder);
/*  imported function                                                       */


#ifdef  __cplusplus
}
#endif

static DWORD StartFilePosition;
int inTek,outTek,inLen,outLen;
byte *inP,*outP;

template <class T>
inline T CLAMP(const T& X,const T& LoX,const T& HiX) { return (X >= LoX)?((X <= HiX)?(X):(HiX)):(LoX); }
template <class T>
inline void SWAP(T& t1,T& t2) { T tmp=t1; t1=t2; t2=tmp; }

#pragma hdrstop
enum { UNIT_SIZE=12, N1=4, N2=4, N3=4, N4=(128+3-1*N1-2*N2-3*N3)/4,
        N_INDEXES=N1+N2+N3+N4 };

#pragma pack(1)
struct BLK_NODE {
    DWORD Stamp;
    BLK_NODE* next;
    BOOL   avail()      const { return (next != NULL); }
    void    link(BLK_NODE* p) { p->next=next; next=p; }
    void  unlink()            { next=next->next; }
    void* remove()            {
        BLK_NODE* p=next;                   unlink();
        Stamp--;                            return p;
    }
    inline void insert(void* pv,int NU);
} BList[N_INDEXES];

struct MEM_BLK: public BLK_NODE { DWORD NU; } _PACK_ATTR;
#pragma pack()

static BYTE Indx2Units[N_INDEXES], Units2Indx[128]; // constants
static DWORD GlueCount, SubAllocatorSize=0;
static BYTE* HeapStart, * pText, * UnitsStart, * LoUnit, * HiUnit;

inline void PrefetchData(void* Addr)
{
#if defined(_USE_PREFETCHING)
    BYTE PrefetchByte = *(volatile BYTE*) Addr;
#endif /* defined(_USE_PREFETCHING) */
}

inline void BLK_NODE::insert(void* pv,int NU) {
    MEM_BLK* p=(MEM_BLK*) pv;               link(p);
    p->Stamp=~0UL;                          p->NU=NU;
    Stamp++;
}

inline UINT U2B(UINT NU) { return 8*NU+4*NU; }

inline void SplitBlock(void* pv,UINT OldIndx,UINT NewIndx){
    UINT i, k, UDiff=Indx2Units[OldIndx]-Indx2Units[NewIndx];
    BYTE* p=((BYTE*) pv)+U2B(Indx2Units[NewIndx]);
    if (Indx2Units[i=Units2Indx[UDiff-1]] != UDiff) {
        k=Indx2Units[--i];                  BList[i].insert(p,k);
        p += U2B(k);                        UDiff -= k;
    }
    BList[Units2Indx[UDiff-1]].insert(p,UDiff);
}

DWORD _STDCALL GetUsedMemory(){
    DWORD i, RetVal=SubAllocatorSize-(HiUnit-LoUnit)-(UnitsStart-pText);
    for (i=0;i < N_INDEXES;i++)
            RetVal -= UNIT_SIZE*Indx2Units[i]*BList[i].Stamp;
    return RetVal;
}
void _STDCALL StopSubAllocator() {
    if ( SubAllocatorSize ) {
        SubAllocatorSize=0;                 
        delete[] HeapStart;
    }
}
BOOL _STDCALL StartSubAllocator(UINT SASize){
    DWORD t=SASize << 20U;
    if (SubAllocatorSize == t) return TRUE;
    StopSubAllocator();
    if ((HeapStart=new BYTE[t]) == NULL) return FALSE;
    SubAllocatorSize=t;                     
    return TRUE;
}
static inline void InitSubAllocator(){
    memset(BList,0,sizeof(BList));
    HiUnit=(pText=HeapStart)+SubAllocatorSize;
    UINT Diff=UNIT_SIZE*(SubAllocatorSize/8/UNIT_SIZE*7);
    LoUnit=UnitsStart=HiUnit-Diff;          
    GlueCount=0;
}
static void GlueFreeBlocks(){
    UINT i, k, sz;
    MEM_BLK s0, * p, * p0, * p1;
    if (LoUnit != HiUnit)                   *LoUnit=0;
    for (i=0, (p0=&s0)->next=NULL;i < N_INDEXES;i++)
            while ( BList[i].avail() ) {
                p=(MEM_BLK*) BList[i].remove();
                if ( !p->NU )               continue;
                while ((p1=p+p->NU)->Stamp == ~0UL) {
                    p->NU += p1->NU;        p1->NU=0;
                }
                p0->link(p);                p0=p;
            }
    while ( s0.avail() ) {
        p=(MEM_BLK*) s0.remove();           sz=p->NU;
        if ( !sz )                          continue;
        for ( ;sz > 128;sz -= 128, p += 128)
                BList[N_INDEXES-1].insert(p,128);
        if (Indx2Units[i=Units2Indx[sz-1]] != sz) {
            k=sz-Indx2Units[--i];           BList[k-1].insert(p+(sz-k),k);
        }
        BList[i].insert(p,Indx2Units[i]);
    }
    GlueCount=1 << 13;
}
static void* _STDCALL AllocUnitsRare(UINT indx){
    UINT i=indx;
    if ( !GlueCount ) {
        GlueFreeBlocks();
        if ( BList[i].avail() )             return BList[i].remove();
    }
    do {
        if (++i == N_INDEXES) {
            GlueCount--;                    i=U2B(Indx2Units[indx]);
            return (UnitsStart-pText > i)?(UnitsStart -= i):(NULL);
        }
    } while ( !BList[i].avail() );
    void* RetVal=BList[i].remove();         SplitBlock(RetVal,i,indx);
    return RetVal;
}
inline void* AllocUnits(UINT NU){
    UINT indx=Units2Indx[NU-1];
    if ( BList[indx].avail() )              return BList[indx].remove();
    void* RetVal=LoUnit;                    LoUnit += U2B(Indx2Units[indx]);
    if (LoUnit <= HiUnit)                   return RetVal;
    LoUnit -= U2B(Indx2Units[indx]);        return AllocUnitsRare(indx);
}
inline void* AllocContext(){
    if (HiUnit != LoUnit)                   return (HiUnit -= UNIT_SIZE);
    else if ( BList->avail() )              return BList->remove();
    else                                    return AllocUnitsRare(0);
}
inline void UnitsCpy(void* Dest,void* Src,UINT NU)
{
    DWORD* p1=(DWORD*) Dest, * p2=(DWORD*) Src;
    do {
        p1[0]=p2[0];                        p1[1]=p2[1];
        p1[2]=p2[2];
        p1 += 3;                            p2 += 3;
    } while ( --NU );
}
inline void* ExpandUnits(void* OldPtr,UINT OldNU)
{
    UINT i0=Units2Indx[OldNU-1], i1=Units2Indx[OldNU-1+1];
    if (i0 == i1)                           return OldPtr;
    void* ptr=AllocUnits(OldNU+1);
    if ( ptr ) {
        UnitsCpy(ptr,OldPtr,OldNU);         BList[i0].insert(OldPtr,OldNU);
    }
    return ptr;
}
inline void* ShrinkUnits(void* OldPtr,UINT OldNU,UINT NewNU)
{
    UINT i0=Units2Indx[OldNU-1], i1=Units2Indx[NewNU-1];
    if (i0 == i1)                           return OldPtr;
    if ( BList[i1].avail() ) {
        void* ptr=BList[i1].remove();       UnitsCpy(ptr,OldPtr,NewNU);
        BList[i0].insert(OldPtr,Indx2Units[i0]);
        return ptr;
    } else {
        SplitBlock(OldPtr,i0,i1);           return OldPtr;
    }
}
inline void FreeUnits(void* ptr,UINT NU) {
    UINT indx=Units2Indx[NU-1];
    BList[indx].insert(ptr,Indx2Units[indx]);
}
inline void SpecialFreeUnit(void* ptr)
{
    if ((BYTE*) ptr != UnitsStart)          BList->insert(ptr,1);
    else { *(DWORD*) ptr=~0UL;              UnitsStart += UNIT_SIZE; }
}
inline void* MoveUnitsUp(void* OldPtr,UINT NU)
{
    UINT indx=Units2Indx[NU-1];
    if ((BYTE*) OldPtr > UnitsStart+16*1024 || (BLK_NODE*) OldPtr > BList[indx].next)
            return OldPtr;
    void* ptr=BList[indx].remove();
    UnitsCpy(ptr,OldPtr,NU);                NU=Indx2Units[indx];
    if ((BYTE*) OldPtr != UnitsStart)       BList[indx].insert(OldPtr,NU);
    else                                    UnitsStart += U2B(NU);
    return ptr;
}
static inline void ExpandTextArea()
{
    BLK_NODE* p;
    UINT Count[N_INDEXES];                  memset(Count,0,sizeof(Count));
    while ((p=(BLK_NODE*) UnitsStart)->Stamp == ~0UL) {
        MEM_BLK* pm=(MEM_BLK*) p;           UnitsStart=(BYTE*) (pm+pm->NU);
        Count[Units2Indx[pm->NU-1]]++;      pm->Stamp=0;
    }
    for (UINT i=0;i < N_INDEXES;i++)
        for (p=BList+i;Count[i] != 0;p=p->next)
            while ( !p->next->Stamp ) {
                p->unlink();                BList[i].Stamp--;
                if ( !--Count[i] )          break;
            }
}



static struct SUBRANGE {
    DWORD LowCount, HighCount, scale;
} SubRange;

enum { TOP=1 << 24, BOT=1 << 15 };
static DWORD low, code, range;

inline void ariInitEncoder(){ low=0; range=DWORD(-1);}

inline void ARI_ENC_NORMALIZE() {		                                        
    while ((low ^ (low+range)) < TOP || range < BOT && ((range= -low & (BOT-1)),1)) { 
	outP[outTek]=(BYTE)(low >> 24); if(outTek<outLen)outTek++;          
        range <<= 8;                        
	low <<= 8;                      
    }                                                                       
}
inline void ariEncodeSymbol(){
    low += SubRange.LowCount*(range /= SubRange.scale);
    range *= SubRange.HighCount-SubRange.LowCount;
}
inline void ariShiftEncodeSymbol(UINT SHIFT){
    low += SubRange.LowCount*(range >>= SHIFT);
    range *= SubRange.HighCount-SubRange.LowCount;
}
inline void ARI_FLUSH_ENCODER() { for(UINT i=0;i < 4;i++) { outP[outTek]=(BYTE)(low >> 24); if(outTek<outLen)outTek++; low <<= 8;  } }
inline void ARI_INIT_DECODER() { low=code=0; range=DWORD(-1); for (UINT i=0;i < 4;i++)  code=(code << 8) | inP[inTek++]; }
inline void ARI_DEC_NORMALIZE() {									            
    while ((low ^ (low+range)) < TOP || range < BOT && ((range= -low & (BOT-1)),1)) {
        code=(code << 8) | inP[inTek]; if(inTek<inLen)inTek++;      			    
        range <<= 8;
        low <<= 8;                      
    }                                                                       
}

inline UINT ariGetCurrentCount() { return (code-low)/(range /= SubRange.scale);}

inline UINT ariGetCurrentShiftCount(UINT SHIFT) { return (code-low)/(range >>= SHIFT);}

inline void ariRemoveSubrange(){
    low += range*SubRange.LowCount;
    range *= SubRange.HighCount-SubRange.LowCount;
}


enum { UP_FREQ=5, INT_BITS=7, PERIOD_BITS=7, TOT_BITS=INT_BITS+PERIOD_BITS,
    INTERVAL=1 << INT_BITS, BIN_SCALE=1 << TOT_BITS, MAX_FREQ=124, O_BOUND=9 };

#pragma pack(1)
static struct SEE2_CONTEXT { // SEE-contexts for PPM-contexts with masked symbols
    WORD Summ;
    BYTE Shift, Count;
    void init(UINT InitVal) { Summ=InitVal << (Shift=PERIOD_BITS-4); Count=7; }
    UINT getMean() {
        UINT RetVal=(Summ >> Shift);        Summ -= RetVal;
        return RetVal+(RetVal == 0);
    }
    void update() {
        if (Shift < PERIOD_BITS && --Count == 0) {
            Summ += Summ;                   Count=3 << Shift++;
        }
    }
} _PACK_ATTR SEE2Cont[24][32], DummySEE2Cont;

static struct PPM_CONTEXT {                 // Notes:
    BYTE NumStats, Flags;                   // 1. NumStats & NumMasked contain
    WORD SummFreq;                          //  number of symbols minus 1
    struct STATE {                          // 2. sizeof(WORD) > sizeof(BYTE)
        BYTE Symbol, Freq;                  // 3. contexts example:
        PPM_CONTEXT* Successor;             // MaxOrder:
    } _PACK_ATTR * Stats;                   //  ABCD    context
    PPM_CONTEXT* Suffix;                    //   BCD    suffix
    inline void encodeBinSymbol(int symbol);//   BCDE   successor
    inline void   encodeSymbol1(int symbol);// other orders:
    inline void   encodeSymbol2(int symbol);//   BCD    context
    inline void           decodeBinSymbol();//    CD    suffix
    inline void             decodeSymbol1();//   BCDE   successor
    inline void             decodeSymbol2();
    inline void           update1(STATE* p);
    inline void           update2(STATE* p);
    inline SEE2_CONTEXT*     makeEscFreq2();
    void                          rescale();
    void      refresh(int OldNU,BOOL Scale);
    PPM_CONTEXT*          cutOff(int Order);
    PPM_CONTEXT*  removeBinConts(int Order);
    STATE& oneState() const { return (STATE&) SummFreq; }
} _PACK_ATTR* MaxContext;
#pragma pack()

static BYTE NS2BSIndx[256], QTable[260];    // constants
static PPM_CONTEXT::STATE* FoundState;      // found next state transition
static int  InitEsc, OrderFall, RunLength, InitRL, MaxOrder;
static BYTE CharMask[256], NumMasked, PrevSuccess, EscCount, PrintCount;
static WORD BinSumm[25][64];                // binary SEE-contexts
static MR_METHOD MRMethod;

inline void SWAP(PPM_CONTEXT::STATE& s1,PPM_CONTEXT::STATE& s2)
{
    WORD t1=(WORD&) s1;                     PPM_CONTEXT* t2=s1.Successor;
    (WORD&) s1 = (WORD&) s2;                s1.Successor=s2.Successor;
    (WORD&) s2 = t1;                        s2.Successor=t2;
}
inline void StateCpy(PPM_CONTEXT::STATE& s1,const PPM_CONTEXT::STATE& s2)
{
    (WORD&) s1=(WORD&) s2;                  s1.Successor=s2.Successor;
}
struct PPMD_STARTUP { inline PPMD_STARTUP(); } PPMd_StartUp;

const DWORD PPMdSignature=0x84ACAF8F, Variant='I';
inline PPMD_STARTUP::PPMD_STARTUP()         // constants initialization
{
    UINT i, k, m, Step;
    for (i=0,k=1;i < N1     ;i++,k += 1)    Indx2Units[i]=k;
    for (k++;i < N1+N2      ;i++,k += 2)    Indx2Units[i]=k;
    for (k++;i < N1+N2+N3   ;i++,k += 3)    Indx2Units[i]=k;
    for (k++;i < N1+N2+N3+N4;i++,k += 4)    Indx2Units[i]=k;
    for (k=i=0;k < 128;k++) {
        i += (Indx2Units[i] < k+1);         Units2Indx[k]=i;
    }
    NS2BSIndx[0]=2*0;                       NS2BSIndx[1]=2*1;
    memset(NS2BSIndx+2,2*2,9);              memset(NS2BSIndx+11,2*3,256-11);
    for (i=0;i < UP_FREQ;i++)               QTable[i]=i;
    for (m=i=UP_FREQ, k=Step=1;i < 260;i++) {
        QTable[i]=m;
        if ( !--k ) { k = ++Step;           m++; }
    }
    (DWORD&) DummySEE2Cont=PPMdSignature;
}

static void _STDCALL StartModelRare(int MaxOrder,MR_METHOD MRMethod)
{
    UINT i, k, m;
    memset(CharMask,0,sizeof(CharMask));    EscCount=PrintCount=1;
    if (MaxOrder < 2) {                     // we are in solid mode
        OrderFall=::MaxOrder;
        for (PPM_CONTEXT* pc=MaxContext;pc->Suffix != NULL;pc=pc->Suffix)
                OrderFall--;
        return;
    }
    OrderFall=::MaxOrder=MaxOrder;          ::MRMethod=MRMethod;
    InitSubAllocator();
    RunLength=InitRL=-((MaxOrder < 12)?MaxOrder:12)-1;
    MaxContext = (PPM_CONTEXT*) AllocContext();
    MaxContext->Suffix=NULL;
    MaxContext->SummFreq=(MaxContext->NumStats=255)+2;
    MaxContext->Stats = (PPM_CONTEXT::STATE*) AllocUnits(256/2);
    for (PrevSuccess=i=0;i < 256;i++) {
        MaxContext->Stats[i].Symbol=i;      MaxContext->Stats[i].Freq=1;
        MaxContext->Stats[i].Successor=NULL;
    }

static const WORD InitBinEsc[]={0x3CDD,0x1F3F,0x59BF,0x48F3,0x64A1,0x5ABC,0x6632,0x6051};
    for (i=m=0;m < 25;m++) {
        while (QTable[i] == m)              i++;
        for (k=0;k < 8;k++)
                BinSumm[m][k]=BIN_SCALE-InitBinEsc[k]/(i+1);
        for (k=8;k < 64;k += 8)
                memcpy(BinSumm[m]+k,BinSumm[m],8*sizeof(WORD));
    }
    for (i=m=0;m < 24;m++) {
        while (QTable[i+3] == m+3)          i++;
        SEE2Cont[m][0].init(2*i+5);
        for (k=1;k < 32;k++)                SEE2Cont[m][k]=SEE2Cont[m][0];
    }
}
void PPM_CONTEXT::refresh(int OldNU,BOOL Scale)
{
    int i=NumStats, EscFreq;               	Scale |= (SummFreq >= 32768);
    STATE* p = Stats = (STATE*) ShrinkUnits(Stats,OldNU,(i+2) >> 1);
    Flags=(Flags & (0x10+0x04*Scale))+0x08*(p->Symbol >= 0x40);
    EscFreq=SummFreq-p->Freq;
    SummFreq = (p->Freq=(p->Freq+Scale) >> Scale);
    do {
        EscFreq -= (++p)->Freq;
        SummFreq += (p->Freq=(p->Freq+Scale) >> Scale);
        Flags |= 0x08*(p->Symbol >= 0x40);
    } while ( --i );
    SummFreq += (EscFreq=(EscFreq+Scale) >> Scale);
}
#define P_CALL(F) ( PrefetchData(p->Successor), \
                    p->Successor=p->Successor->F(Order+1))
PPM_CONTEXT* PPM_CONTEXT::cutOff(int Order)
{
    int i, tmp;
    STATE* p;
    if ( !NumStats ) {
        if ((BYTE*) (p=&oneState())->Successor >= UnitsStart) {
            if (Order < MaxOrder)           P_CALL(cutOff);
            else                            p->Successor=NULL;
            if (!p->Successor && Order > O_BOUND)
                    goto REMOVE;
            return this;
        } else {
REMOVE:     SpecialFreeUnit(this);          return NULL;
        }
    }
    PrefetchData(Stats);
    Stats = (STATE*) MoveUnitsUp(Stats,tmp=(NumStats+2) >> 1);
    for (p=Stats+(i=NumStats);p >= Stats;p--)
            if ((BYTE*) p->Successor < UnitsStart) {
                p->Successor=NULL;          SWAP(*p,Stats[i--]);
            } else if (Order < MaxOrder)    P_CALL(cutOff);
            else                            p->Successor=NULL;
    if (i != NumStats && Order) {
        NumStats=i;                         p=Stats;
        if (i < 0) { FreeUnits(p,tmp);      goto REMOVE; }
        else if (i == 0) {
            Flags=(Flags & 0x10)+0x08*(p->Symbol >= 0x40);
            StateCpy(oneState(),*p);        FreeUnits(p,tmp);
            oneState().Freq=(oneState().Freq+11) >> 3;
        } else                              refresh(tmp,SummFreq > 16*i);
    }
    return this;
}
PPM_CONTEXT* PPM_CONTEXT::removeBinConts(int Order)
{
    STATE* p;
    if ( !NumStats ) {
        p=&oneState();
        if ((BYTE*) p->Successor >= UnitsStart && Order < MaxOrder)
                P_CALL(removeBinConts);
        else                                p->Successor=NULL;
        if (!p->Successor && (!Suffix->NumStats || Suffix->Flags == 0xFF)) {
            FreeUnits(this,1);              return NULL;
        } else                              return this;
    }
    PrefetchData(Stats);
    for (p=Stats+NumStats;p >= Stats;p--)
            if ((BYTE*) p->Successor >= UnitsStart && Order < MaxOrder)
                    P_CALL(removeBinConts);
            else                            p->Successor=NULL;
    return this;
}
static void RestoreModelRare(PPM_CONTEXT* pc1,PPM_CONTEXT* MinContext,
        PPM_CONTEXT* FSuccessor)
{
    PPM_CONTEXT* pc;
    PPM_CONTEXT::STATE* p;
    for (pc=MaxContext, pText=HeapStart;pc != pc1;pc=pc->Suffix)
            if (--(pc->NumStats) == 0) {
                pc->Flags=(pc->Flags & 0x10)+0x08*(pc->Stats->Symbol >= 0x40);
                p=pc->Stats;                StateCpy(pc->oneState(),*p);
                SpecialFreeUnit(p);
                pc->oneState().Freq=(pc->oneState().Freq+11) >> 3;
            } else
                    pc->refresh((pc->NumStats+3) >> 1,FALSE);
    for ( ;pc != MinContext;pc=pc->Suffix)
            if ( !pc->NumStats )
                    pc->oneState().Freq -= pc->oneState().Freq >> 1;
            else if ((pc->SummFreq += 4) > 128+4*pc->NumStats)
                    pc->refresh((pc->NumStats+2) >> 1,TRUE);
    if (MRMethod > MRM_FREEZE) {
        MaxContext=FSuccessor;              GlueCount += !(BList[1].Stamp & 1);
    } else if (MRMethod == MRM_FREEZE) {
        while ( MaxContext->Suffix )        MaxContext=MaxContext->Suffix;
        MaxContext->removeBinConts(0);      MRMethod=MR_METHOD(MRMethod+1);
        GlueCount=0;                        OrderFall=MaxOrder;
    } else if (MRMethod == MRM_RESTART || GetUsedMemory() < (SubAllocatorSize >> 1)) {
        StartModelRare(MaxOrder,MRMethod);
        EscCount=0;                         PrintCount=0xFF;
    } else {
        while ( MaxContext->Suffix )        MaxContext=MaxContext->Suffix;
        do {
            MaxContext->cutOff(0);          ExpandTextArea();
        } while (GetUsedMemory() > 3*(SubAllocatorSize >> 2));
        GlueCount=0;                        OrderFall=MaxOrder;
    }
}
static PPM_CONTEXT* _FASTCALL CreateSuccessors(BOOL Skip,PPM_CONTEXT::STATE* p,
        PPM_CONTEXT* pc);
static PPM_CONTEXT* _FASTCALL ReduceOrder(PPM_CONTEXT::STATE* p,PPM_CONTEXT* pc)
{
    PPM_CONTEXT::STATE* p1,  * ps[MAX_O+1], ** pps=ps;
    PPM_CONTEXT* pc1=pc, * UpBranch = (PPM_CONTEXT*) pText;
    BYTE tmp, sym=FoundState->Symbol;
    *pps++ = FoundState;                    FoundState->Successor=UpBranch;
    OrderFall++;
    if ( p ) { pc=pc->Suffix;               goto LOOP_ENTRY; }
    for ( ; ; ) {
        if ( !pc->Suffix ) {
            if (MRMethod > MRM_FREEZE) {
FROZEN:         do { (*--pps)->Successor = pc; } while (pps != ps);
                pText=HeapStart+1;          OrderFall=1;
            }
            return pc;
        }
        pc=pc->Suffix;
        if ( pc->NumStats ) {
            if ((p=pc->Stats)->Symbol != sym)
                    do { tmp=p[1].Symbol;   p++; } while (tmp != sym);
            tmp=2*(p->Freq < MAX_FREQ-9);
            p->Freq += tmp;                 pc->SummFreq += tmp;
        } else { p=&(pc->oneState());       p->Freq += (p->Freq < 32); }
LOOP_ENTRY:
        if ( p->Successor )                 break;
        *pps++ = p;                         p->Successor=UpBranch;
        OrderFall++;
    }
    if (MRMethod > MRM_FREEZE) {
        pc = p->Successor;                  goto FROZEN;
    } else if (p->Successor <= UpBranch) {
        p1=FoundState;                      FoundState=p;
        p->Successor=CreateSuccessors(FALSE,NULL,pc);
        FoundState=p1;
    }
    if (OrderFall == 1 && pc1 == MaxContext) {
        FoundState->Successor=p->Successor; pText--;
    }
    return p->Successor;
}
void PPM_CONTEXT::rescale()
{
    UINT OldNU, Adder, EscFreq, i=NumStats;
    STATE tmp, * p1, * p;
    for (p=FoundState;p != Stats;p--)       SWAP(p[0],p[-1]);
    p->Freq += 4;                           SummFreq += 4;
    EscFreq=SummFreq-p->Freq;
    Adder=(OrderFall != 0 || MRMethod > MRM_FREEZE);
    SummFreq = (p->Freq=(p->Freq+Adder) >> 1);
    do {
        EscFreq -= (++p)->Freq;
        SummFreq += (p->Freq=(p->Freq+Adder) >> 1);
        if (p[0].Freq > p[-1].Freq) {
            StateCpy(tmp,*(p1=p));
            do StateCpy(p1[0],p1[-1]); while (tmp.Freq > (--p1)[-1].Freq);
            StateCpy(*p1,tmp);
        }
    } while ( --i );
    if (p->Freq == 0) {
        do { i++; } while ((--p)->Freq == 0);
        EscFreq += i;                       OldNU=(NumStats+2) >> 1;
        if ((NumStats -= i) == 0) {
            StateCpy(tmp,*Stats);
            tmp.Freq=(2*tmp.Freq+EscFreq-1)/EscFreq;
            if (tmp.Freq > MAX_FREQ/3)      tmp.Freq=MAX_FREQ/3;
            FreeUnits(Stats,OldNU);         StateCpy(oneState(),tmp);
            Flags=(Flags & 0x10)+0x08*(tmp.Symbol >= 0x40);
            FoundState=&oneState();         return;
        }
        Stats = (STATE*) ShrinkUnits(Stats,OldNU,(NumStats+2) >> 1);
        Flags &= ~0x08;                     i=NumStats;
        Flags |= 0x08*((p=Stats)->Symbol >= 0x40);
        do { Flags |= 0x08*((++p)->Symbol >= 0x40); } while ( --i );
    }
    SummFreq += (EscFreq -= (EscFreq >> 1));
    Flags |= 0x04;                          FoundState=Stats;
}
static PPM_CONTEXT* _FASTCALL CreateSuccessors(BOOL Skip,PPM_CONTEXT::STATE* p,
        PPM_CONTEXT* pc)
{
    PPM_CONTEXT ct, * UpBranch=FoundState->Successor;
    PPM_CONTEXT::STATE* ps[MAX_O], ** pps=ps;
    UINT cf, s0;
    BYTE tmp, sym=FoundState->Symbol;
    if ( !Skip ) {
        *pps++ = FoundState;
        if ( !pc->Suffix )                  goto NO_LOOP;
    }
    if ( p ) { pc=pc->Suffix;               goto LOOP_ENTRY; }
    do {
        pc=pc->Suffix;
        if ( pc->NumStats ) {
            if ((p=pc->Stats)->Symbol != sym)
                    do { tmp=p[1].Symbol;   p++; } while (tmp != sym);
            tmp=(p->Freq < MAX_FREQ-9);
            p->Freq += tmp;                 pc->SummFreq += tmp;
        } else {
            p=&(pc->oneState());
            p->Freq += (!pc->Suffix->NumStats & (p->Freq < 24));
        }
LOOP_ENTRY:
        if (p->Successor != UpBranch) {
            pc=p->Successor;                break;
        }
        *pps++ = p;
    } while ( pc->Suffix );
NO_LOOP:
    if (pps == ps)                          return pc;
    ct.NumStats=0;                          ct.Flags=0x10*(sym >= 0x40);
    ct.oneState().Symbol=sym=*(BYTE*) UpBranch;
    ct.oneState().Successor=(PPM_CONTEXT*) (((BYTE*) UpBranch)+1);
    ct.Flags |= 0x08*(sym >= 0x40);
    if ( pc->NumStats ) {
        if ((p=pc->Stats)->Symbol != sym)
                do { tmp=p[1].Symbol;       p++; } while (tmp != sym);
        s0=pc->SummFreq-pc->NumStats-(cf=p->Freq-1);
        ct.oneState().Freq=1+((2*cf <= s0)?(5*cf > s0):((cf+2*s0-3)/s0));
    } else
            ct.oneState().Freq=pc->oneState().Freq;
    do {
        PPM_CONTEXT* pc1 = (PPM_CONTEXT*) AllocContext();
        if ( !pc1 )                         return NULL;
        ((DWORD*) pc1)[0] = ((DWORD*) &ct)[0];
        ((DWORD*) pc1)[1] = ((DWORD*) &ct)[1];
        pc1->Suffix=pc;                     (*--pps)->Successor=pc=pc1;
    } while (pps != ps);
    return pc;
}
static inline void UpdateModel(PPM_CONTEXT* MinContext)
{
    PPM_CONTEXT::STATE* p=NULL;
    PPM_CONTEXT* Successor, * FSuccessor, * pc, * pc1=MaxContext;
    UINT ns1, ns, cf, sf, s0, FFreq=FoundState->Freq;
    BYTE Flag, sym, FSymbol=FoundState->Symbol;
    FSuccessor=FoundState->Successor;       pc=MinContext->Suffix;
    if (FFreq < MAX_FREQ/4 && pc) {
        if ( pc->NumStats ) {
            if ((p=pc->Stats)->Symbol != FSymbol) {
                do { sym=p[1].Symbol;       p++; } while (sym != FSymbol);
                if (p[0].Freq >= p[-1].Freq) {
                    SWAP(p[0],p[-1]);       p--;
                }
            }
            cf=2*(p->Freq < MAX_FREQ-9);
            p->Freq += cf;                  pc->SummFreq += cf;
        } else { p=&(pc->oneState());       p->Freq += (p->Freq < 32); }
    }
    if (!OrderFall && FSuccessor) {
        FoundState->Successor=CreateSuccessors(TRUE,p,MinContext);
        if ( !FoundState->Successor )       goto RESTART_MODEL;
        MaxContext=FoundState->Successor;   return;
    }
    *pText++ = FSymbol;                     Successor = (PPM_CONTEXT*) pText;
    if (pText >= UnitsStart)                goto RESTART_MODEL;
    if ( FSuccessor ) {
        if ((BYTE*) FSuccessor < UnitsStart)
                FSuccessor=CreateSuccessors(FALSE,p,MinContext);
    } else
                FSuccessor=ReduceOrder(p,MinContext);
    if ( !FSuccessor )                      goto RESTART_MODEL;
    if ( !--OrderFall ) {
        Successor=FSuccessor;               pText -= (MaxContext != MinContext);
    } else if (MRMethod > MRM_FREEZE) {
        Successor=FSuccessor;               pText=HeapStart;
        OrderFall=0;
    }
    s0=MinContext->SummFreq-(ns=MinContext->NumStats)-FFreq;
    for (Flag=0x08*(FSymbol >= 0x40);pc1 != MinContext;pc1=pc1->Suffix) {
        if ((ns1=pc1->NumStats) != 0) {
            if ((ns1 & 1) != 0) {
                p=(PPM_CONTEXT::STATE*) ExpandUnits(pc1->Stats,(ns1+1) >> 1);
                if ( !p )                   goto RESTART_MODEL;
                pc1->Stats=p;
            }
            pc1->SummFreq += (3*ns1+1 < ns);
        } else {
            p=(PPM_CONTEXT::STATE*) AllocUnits(1);
            if ( !p )                       goto RESTART_MODEL;
            StateCpy(*p,pc1->oneState());   pc1->Stats=p;
            if (p->Freq < MAX_FREQ/4-1)     p->Freq += p->Freq;
            else                            p->Freq  = MAX_FREQ-4;
            pc1->SummFreq=p->Freq+InitEsc+(ns > 2);
        }
        cf=2*FFreq*(pc1->SummFreq+6);       sf=s0+pc1->SummFreq;
        if (cf < 6*sf) {
            cf=1+(cf > sf)+(cf >= 4*sf);
            pc1->SummFreq += 4;
        } else {
            cf=4+(cf > 9*sf)+(cf > 12*sf)+(cf > 15*sf);
            pc1->SummFreq += cf;
        }
        p=pc1->Stats+(++pc1->NumStats);     p->Successor=Successor;
        p->Symbol = FSymbol;                p->Freq = cf;
        pc1->Flags |= Flag;
    }
    MaxContext=FSuccessor;                  return;
RESTART_MODEL:
    RestoreModelRare(pc1,MinContext,FSuccessor);
}
// Tabulated escapes for exponential symbol distribution
static const BYTE ExpEscape[16]={ 25,14, 9, 7, 5, 5, 4, 4, 4, 3, 3, 3, 2, 2, 2, 2 };
#define GET_MEAN(SUMM,SHIFT,ROUND) ((SUMM+(1 << (SHIFT-ROUND))) >> (SHIFT))
inline void PPM_CONTEXT::encodeBinSymbol(int symbol)
{
    BYTE indx=NS2BSIndx[Suffix->NumStats]+PrevSuccess+Flags;
    STATE& rs=oneState();
    WORD& bs=BinSumm[QTable[rs.Freq-1]][indx+((RunLength >> 26) & 0x20)];
    if (rs.Symbol == symbol) {
        FoundState=&rs;                     rs.Freq += (rs.Freq < 196);
        SubRange.LowCount=0;                SubRange.HighCount=bs;
        bs += INTERVAL-GET_MEAN(bs,PERIOD_BITS,2);
        PrevSuccess=1;                      RunLength++;
    } else {
        SubRange.LowCount=bs;               bs -= GET_MEAN(bs,PERIOD_BITS,2);
        SubRange.HighCount=BIN_SCALE;       InitEsc=ExpEscape[bs >> 10];
        CharMask[rs.Symbol]=EscCount;
        NumMasked=PrevSuccess=0;            FoundState=NULL;
    }
}
inline void PPM_CONTEXT::decodeBinSymbol()
{
    BYTE indx=NS2BSIndx[Suffix->NumStats]+PrevSuccess+Flags;
    STATE& rs=oneState();
    WORD& bs=BinSumm[QTable[rs.Freq-1]][indx+((RunLength >> 26) & 0x20)];
    if (ariGetCurrentShiftCount(TOT_BITS) < bs) {
        FoundState=&rs;                     rs.Freq += (rs.Freq < 196);
        SubRange.LowCount=0;                SubRange.HighCount=bs;
        bs += INTERVAL-GET_MEAN(bs,PERIOD_BITS,2);
        PrevSuccess=1;                      RunLength++;
    } else {
        SubRange.LowCount=bs;               bs -= GET_MEAN(bs,PERIOD_BITS,2);
        SubRange.HighCount=BIN_SCALE;       InitEsc=ExpEscape[bs >> 10];
        CharMask[rs.Symbol]=EscCount;
        NumMasked=PrevSuccess=0;            FoundState=NULL;
    }
}
inline void PPM_CONTEXT::update1(STATE* p)
{
    (FoundState=p)->Freq += 4;              SummFreq += 4;
    if (p[0].Freq > p[-1].Freq) {
        SWAP(p[0],p[-1]);                   FoundState=--p;
        if (p->Freq > MAX_FREQ)             rescale();
    }
}
inline void PPM_CONTEXT::encodeSymbol1(int symbol)
{
    UINT LoCnt, i=Stats->Symbol;
    STATE* p=Stats;                         SubRange.scale=SummFreq;
    if (i == symbol) {
        PrevSuccess=(2*(SubRange.HighCount=p->Freq) >= SubRange.scale);
        (FoundState=p)->Freq += 4;          SummFreq += 4;
        RunLength += PrevSuccess;
        if (p->Freq > MAX_FREQ)             rescale();
        SubRange.LowCount=0;                return;
    }
    LoCnt=p->Freq;
    i=NumStats;                             PrevSuccess=0;
    while ((++p)->Symbol != symbol) {
        LoCnt += p->Freq;
        if (--i == 0) {
            if ( Suffix )                   PrefetchData(Suffix);
            SubRange.LowCount=LoCnt;        CharMask[p->Symbol]=EscCount;
            i=NumMasked=NumStats;           FoundState=NULL;
            do { CharMask[(--p)->Symbol]=EscCount; } while ( --i );
            SubRange.HighCount=SubRange.scale;
            return;
        }
    }
    SubRange.HighCount=(SubRange.LowCount=LoCnt)+p->Freq;
    update1(p);
}
inline void PPM_CONTEXT::decodeSymbol1()
{
    UINT i, count, HiCnt=Stats->Freq;
    STATE* p=Stats;                         SubRange.scale=SummFreq;
    if ((count=ariGetCurrentCount()) < HiCnt) {
        PrevSuccess=(2*(SubRange.HighCount=HiCnt) >= SubRange.scale);
        (FoundState=p)->Freq=(HiCnt += 4);  SummFreq += 4;
        RunLength += PrevSuccess;
        if (HiCnt > MAX_FREQ)               rescale();
        SubRange.LowCount=0;                return;
    }
    i=NumStats;                             PrevSuccess=0;
    while ((HiCnt += (++p)->Freq) <= count)
        if (--i == 0) {
            if ( Suffix )                   PrefetchData(Suffix);
            SubRange.LowCount=HiCnt;        CharMask[p->Symbol]=EscCount;
            i=NumMasked=NumStats;           FoundState=NULL;
            do { CharMask[(--p)->Symbol]=EscCount; } while ( --i );
            SubRange.HighCount=SubRange.scale;
            return;
        }
    SubRange.LowCount=(SubRange.HighCount=HiCnt)-p->Freq;
    update1(p);
}
inline void PPM_CONTEXT::update2(STATE* p)
{
    (FoundState=p)->Freq += 4;              SummFreq += 4;
    if (p->Freq > MAX_FREQ)                 rescale();
    EscCount++;                             RunLength=InitRL;
}
inline SEE2_CONTEXT* PPM_CONTEXT::makeEscFreq2()
{
    BYTE* pb=(BYTE*) Stats;                 UINT t=2*NumStats;
    PrefetchData(pb);                       PrefetchData(pb+t);
    PrefetchData(pb += 2*t);                PrefetchData(pb+t);
    SEE2_CONTEXT* psee2c;
    if (NumStats != 0xFF) {
        t=Suffix->NumStats;
        psee2c=SEE2Cont[QTable[NumStats+2]-3]+(SummFreq > 11*(NumStats+1));
        psee2c += 2*(2*NumStats < t+NumMasked)+Flags;
        SubRange.scale=psee2c->getMean();
    } else {
        psee2c=&DummySEE2Cont;              SubRange.scale=1;
    }
    return psee2c;
}
inline void PPM_CONTEXT::encodeSymbol2(int symbol)
{
    SEE2_CONTEXT* psee2c=makeEscFreq2();
    UINT Sym, LoCnt=0, i=NumStats-NumMasked;
    STATE* p1, * p=Stats-1;
    do {
        do { Sym=p[1].Symbol;   p++; } while (CharMask[Sym] == EscCount);
        CharMask[Sym]=EscCount;
        if (Sym == symbol)                  goto SYMBOL_FOUND;
        LoCnt += p->Freq;
    } while ( --i );
    SubRange.HighCount=(SubRange.scale += (SubRange.LowCount=LoCnt));
    psee2c->Summ += SubRange.scale;         NumMasked = NumStats;
    return;
SYMBOL_FOUND:
    SubRange.LowCount=LoCnt;                SubRange.HighCount=(LoCnt+=p->Freq);
    for (p1=p; --i ; ) {
        do { Sym=p1[1].Symbol;  p1++; } while (CharMask[Sym] == EscCount);
        LoCnt += p1->Freq;
    }
    SubRange.scale += LoCnt;
    psee2c->update();                       update2(p);
}
inline void PPM_CONTEXT::decodeSymbol2()
{
    SEE2_CONTEXT* psee2c=makeEscFreq2();
    UINT Sym, count, HiCnt=0, i=NumStats-NumMasked;
    STATE* ps[256], ** pps=ps, * p=Stats-1;
    do {
        do { Sym=p[1].Symbol;   p++; } while (CharMask[Sym] == EscCount);
        HiCnt += p->Freq;                   *pps++ = p;
    } while ( --i );
    SubRange.scale += HiCnt;                count=ariGetCurrentCount();
    p=*(pps=ps);
    if (count < HiCnt) {
        HiCnt=0;
        while ((HiCnt += p->Freq) <= count) p=*++pps;
        SubRange.LowCount = (SubRange.HighCount=HiCnt)-p->Freq;
        psee2c->update();                   update2(p);
    } else {
        SubRange.LowCount=HiCnt;            SubRange.HighCount=SubRange.scale;
        i=NumStats-NumMasked;               NumMasked = NumStats;
        do { CharMask[(*pps)->Symbol]=EscCount; pps++; } while ( --i );
        psee2c->Summ += SubRange.scale;
    }
}
inline void ClearMask()
{
    EscCount=1;                             
	memset(CharMask,0,sizeof(CharMask));
}
int _STDCALL EncodeFile(byte inM[],byte outM[], int inLen0, int MaxOrder)
{
	inP=inM;outP=outM;inLen=inLen0;outLen=inLen0;inTek=0;outTek=0;
    ariInitEncoder();                       
	StartModelRare(MaxOrder,MRM_RESTART);
    for (PPM_CONTEXT* MinContext; ; ) {
		if(outTek>=outLen)return outLen; //невыгодно кодировать - больше чем было
        BYTE ns=(MinContext=MaxContext)->NumStats;
        int c = inP[inTek++];if(inTek>inLen)c=-1;//_PPMD_E_GETC(DecodedFile);
        if ( ns ) {
            MinContext->encodeSymbol1(c);   
			ariEncodeSymbol();
        } else {
            MinContext->encodeBinSymbol(c); 
			ariShiftEncodeSymbol(TOT_BITS);
        }
        while ( !FoundState ) {
            ARI_ENC_NORMALIZE();
            do {
                OrderFall++;                
				MinContext=MinContext->Suffix;
                if ( !MinContext ) goto STOP_ENCODING;
            } while (MinContext->NumStats == NumMasked);
            MinContext->encodeSymbol2(c);   
			ariEncodeSymbol();
        }
        if (!OrderFall && (BYTE*) FoundState->Successor >= UnitsStart)
                PrefetchData(MaxContext=FoundState->Successor);
        else {
            UpdateModel(MinContext);        
			PrefetchData(MaxContext);
            if (EscCount == 0) ClearMask();
        }
        ARI_ENC_NORMALIZE();
    }
STOP_ENCODING:
    ARI_FLUSH_ENCODER();         
return outTek;
}

int _STDCALL DecodeFile(byte inM[],byte outM[],int inLen0, int outLen0, int MaxOrder){
	inP=inM;outP=outM;inLen=inLen0;outLen=outLen0;inTek=0;outTek=0;
    ARI_INIT_DECODER();          
	StartModelRare(MaxOrder,MRM_RESTART);
    PPM_CONTEXT* MinContext=MaxContext;
    for (BYTE ns=MinContext->NumStats; ; ) {
        ( ns )?(MinContext->decodeSymbol1()):(MinContext->decodeBinSymbol());
        ariRemoveSubrange();
        while ( !FoundState ) {
            ARI_DEC_NORMALIZE();
            if(inTek>=inLen)goto STOP_DECODING;// внезапно кончились входные данные =неполный
            do {
                OrderFall++;                
				MinContext=MinContext->Suffix;
                if ( !MinContext )  goto STOP_DECODING;
            } while (MinContext->NumStats == NumMasked);
            MinContext->decodeSymbol2();    
			ariRemoveSubrange();
        }
        outP[outTek]=(FoundState->Symbol);
		 if(outTek<outLen)outTek++;
		 
		 if(outTek>=outLen)goto STOP_DECODING; //переполнение буфера = размер больше чем было
        if (!OrderFall && (BYTE*) FoundState->Successor >= UnitsStart)
                PrefetchData(MaxContext=FoundState->Successor);
        else {
            UpdateModel(MinContext);        
			PrefetchData(MaxContext);
            if (EscCount == 0)  ClearMask();
        }
        ns=(MinContext=MaxContext)->NumStats;
        ARI_DEC_NORMALIZE();
    }
STOP_DECODING:
return outTek;    
}



BOOL APIENTRY DllMain(HANDLE hInst, DWORD ul_reason_being_called, LPVOID lpReserved)
{
    return 1;
        UNREFERENCED_PARAMETER(hInst);
        UNREFERENCED_PARAMETER(ul_reason_being_called);
        UNREFERENCED_PARAMETER(lpReserved);
}
//===============================================================


inline int PrepareCoding(int SASize){
    if ( !StartSubAllocator(SASize) ) {  return(-1);  }
    StartFilePosition=0;
	return 0;
}
int APIENTRY  EncodeMas(byte inM[],byte outM[],int inN0, int MaxOrder0){
	if(!StartSubAllocator(10)) return(-1);
    StartFilePosition=0;          
	
	if(MaxOrder0<2)MaxOrder0=2;
	if(MaxOrder0>16)MaxOrder0=16;
	
	int k=EncodeFile(inM, outM, inN0, MaxOrder0);
	StopSubAllocator();
	return k;
}
int APIENTRY  DecodeMas(byte inM[],byte outM[],int inN0, int outN0, int MaxOrder0){
    if(!StartSubAllocator(10)) return(-1);
    StartFilePosition=0;    

	if(MaxOrder0<2)MaxOrder0=2;
	if(MaxOrder0>16)MaxOrder0=16;

	int k=DecodeFile(inM,outM,inN0,outN0,MaxOrder0);
	StopSubAllocator();
    return k;
}



